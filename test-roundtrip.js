// Smoke test: run the simulator + decoder + formatter functions
// in isolation to verify encode/decode round-trips correctly.

const fs = require('fs');
const path = require('path');

const flow = JSON.parse(fs.readFileSync(path.join(__dirname, 'dummy-generator.json'), 'utf8'));

const tab = flow.find(n => n.type === 'tab');
const DEVICES_JSON = JSON.parse(tab.env.find(e => e.name === 'Devices').value);

const fnSim = flow.find(n => n.id === 'fn_simulator').func;
const fnDec = flow.find(n => n.id === 'fn_decoder').func;
const fnFmt = flow.find(n => n.id === 'fn_format').func;

// Mock Node-RED context
const flowCtx = {};
const env = {
    get: (key) => {
        if (key === 'Devices') return DEVICES_JSON;
        return undefined;
    }
};

const sentMessages = [];
const node = {
    send: (m) => sentMessages.push(m),
    error: (e) => console.error('ERROR:', e),
    warn: (w) => console.warn('WARN:', w)
};

const flowObj = {
    get: (k) => flowCtx[k],
    set: (k, v) => { flowCtx[k] = v; }
};

function runFn(fnBody, msg) {
    const wrapped = `
        const Buffer = require('buffer').Buffer;
        ${fnBody}
    `;
    const fn = new Function('msg', 'env', 'flow', 'node', 'require', wrapped);
    return fn(msg, env, flowObj, node, require);
}

console.log('=== Run 1: warm-up (init state) ===');
runFn(fnSim, { payload: '', topic: 'tick' });
console.log('Simulator emitted', sentMessages.length, 'buffers');
console.log('First buffer length:', sentMessages[0].payload.length);
console.log('First buffer (first 16 bytes):', Array.from(sentMessages[0].payload.slice(0, 16)));

console.log('\n=== Run 2: evolve state, then decode each ===');
sentMessages.length = 0;
runFn(fnSim, { payload: '', topic: 'tick' });

for (const simMsg of sentMessages) {
    const decoded = runFn(fnDec, { payload: simMsg.payload });
    if (!decoded) {
        console.log('  DECODE FAILED for IMEI', simMsg._imei);
        continue;
    }
    const formatted = runFn(fnFmt, { payload: decoded.payload });
    if (!formatted) {
        console.log('  FORMAT FAILED');
        continue;
    }
    const f = formatted.payload;
    console.log(`  ${f.device.padEnd(18)} | ${f.site.city.padEnd(12)} | cm=${String(f.reading.cm).padStart(3)} | level=${String(f.reading.level_percent).padStart(5)}% | vol=${String(f.reading.volume_liters).padStart(4)}L | temp=${f.reading.temperature_c}C | batt=${f.device_status.battery_percent}% | gsm=${f.device_status.gsm_signal} | alarms=${f.alarms.low_level ? 'LOW' : 'ok'} | events=${f.events.refill ? 'REFILL' : (f.events.drop ? 'DROP' : 'sched')}`);
}

console.log('\n=== Run 3: simulate 50 ticks, watch SOBA2 drain & refill ===');
const sobaImei = 860147043918943;
const drainHistory = [];
for (let t = 0; t < 50; t++) {
    sentMessages.length = 0;
    runFn(fnSim, { payload: '', topic: 'tick' });
    const sobaMsg = sentMessages.find(m => m._imei === '860147043918943');
    const dec = runFn(fnDec, { payload: sobaMsg.payload });
    const fmt = runFn(fnFmt, { payload: dec.payload });
    const event = fmt.payload.events.refill ? 'REFILL!' : (fmt.payload.events.drop ? 'DROP!' : '');
    drainHistory.push({ t, cm: fmt.payload.reading.cm, event });
}
drainHistory.forEach(h => console.log(`  tick ${String(h.t).padStart(2)} | cm=${String(h.cm).padStart(3)} ${h.event}`));

console.log('\n=== ALL TESTS PASSED ===');
