import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Code, Mail, Globe, ExternalLink, Building2 } from 'lucide-react';
import { NodeRedFlow } from '@/components/NodeRedFlow';

export const metadata = {
  title: 'About this project | Canar Fuel Tanker Monitor',
  description:
    'How a 2023 fuel tanker monitoring system, originally built at GTS Hi-Tech for Canar in Sudan, was rebuilt in 2026 with Next.js, React, and Tailwind — preserving the original binary protocol and customer-approved dashboard design.',
};

export default function AboutPage() {
  return (
    <article className="max-w-3xl mx-auto space-y-10 py-2">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-canar-blue"
      >
        <ChevronLeft className="size-4" />
        Back to dashboard
      </Link>

      {/* Hero */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-canar-blue/10 text-canar-blue text-xs font-medium">
          About this project
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
          A 2023 fuel monitoring system from Sudan, rebuilt in 2026.
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          What you&apos;re looking at is a faithful rebuild of an industrial IoT
          system originally deployed in Khartoum — same binary protocol, same
          customer-approved dashboard design, modern web stack.
        </p>
      </header>

      {/* Story */}
      <Section title="The story">
        <p>
          In 2022–2023, I was working at{' '}
          <a
            href="https://gts-hitech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-canar-blue hover:underline"
          >
            GTS Hi-Tech
          </a>
          {' '}(then trading as Gezira Telecom Solutions) in Sudan when we won a
          project with{' '}
          <a
            href="https://www.canar.com.sd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-canar-blue hover:underline"
          >
            Canar
          </a>
          , one of the country&apos;s telecom companies. They needed to monitor
          fuel levels in the tanks powering their backup generators across
          multiple sites — Khartoum, Omdurman, and others.
        </p>
        <p>
          We deployed real ultrasonic level sensors (Tekelec CANAR family) on
          real fuel tanks. Each sensor pushed 140-byte binary packets over GSM/3G
          to a Node-RED backend running on our VPS. A ThingsBoard CE dashboard,
          hosted on the same VPS, gave Canar a live view of every tank: current
          level, refill events, temperature, battery, alarms. It ran in
          production. The customer signed off. We got paid.
        </p>
        <p>
          Then in April 2023, war broke out. We lost access to the VPS, the
          ThingsBoard server, the customer relationships, and most of the
          infrastructure we&apos;d built. The only things that survived were
          Node-RED flow exports (JSON) and a ThingsBoard dashboard backup
          (more JSON) that lived on a personal drive.
        </p>
        <p>
          This dashboard is that system, rebuilt three years later from Saudi
          Arabia, with the same binary protocol, the same site names, and the
          same customer-approved visual design — but on a modern, deployable,
          forever-runnable stack.
        </p>
      </Section>

      {/* What you're looking at */}
      <Section title="What you're looking at">
        <p>
          A live monitoring dashboard for <strong>6 virtual fuel tankers</strong>{' '}
          spread across Sudan. The 6 sites mirror the geographic reality of the
          original Canar deployment:
        </p>
        <ul className="list-disc list-inside space-y-1 text-zinc-700">
          <li>SOBA2 — Khartoum, Soba (original production site)</li>
          <li>KRT_AIRPORT — Khartoum International Airport</li>
          <li>OMD_TOWER_18 — Omdurman</li>
          <li>PRT_SUDAN_DEPOT — Port Sudan</li>
          <li>WAD_MADANI_HUB — Wad Madani</li>
          <li>KASSALA_EAST — Kassala</li>
        </ul>
        <p>
          Each simulated sensor reports: current fuel level (cm, liters, %),
          temperature, battery voltage, GSM signal, refill events, drop events
          (simulated theft / leak), and low-level alarms — all the same fields
          the real sensors emitted.
        </p>
      </Section>

      {/* Two modes */}
      <Section title="Two modes of operation">
        <Callout color="blue" title="Default — browser simulator">
          The dashboard ships with a built-in TypeScript port of the Node-RED
          simulator. It emits realistic tank updates every 3 seconds with
          natural drain, occasional refills, and rare drop events. The deployed
          Netlify version uses this so visitors see live-looking data without
          needing any backend.
        </Callout>
        <Callout color="green" title="With Node-RED — real pipeline">
          Run Node-RED locally, import the included{' '}
          <code className="text-xs px-1 py-0.5 bg-zinc-100 rounded">
            dummy-generator.json
          </code>{' '}
          flow, and this dashboard automatically connects to its WebSocket at{' '}
          <code className="text-xs px-1 py-0.5 bg-zinc-100 rounded">
            ws://localhost:1880/ws/tanks
          </code>
          . The badge in the top right flips from &quot;Browser simulator&quot;
          to &quot;Node-RED WS.&quot; You&apos;re now seeing data flow through
          the actual rebuilt backend pipeline.
        </Callout>
      </Section>

      {/* How it works */}
      <Section title="How it works">
        <p>
          Below is a mockup of the actual Node-RED simulator flow — same
          structure as what you&apos;d see if you imported{' '}
          <code className="text-xs px-1 py-0.5 bg-zinc-100 rounded">
            dummy-generator.json
          </code>{' '}
          into your own Node-RED instance:
        </p>

        <NodeRedFlow />

        <p className="pt-2">
          Each function node holds a chunk of pure JavaScript. The Tank
          Simulator generates 6 binary buffers per tick, the Decoder reverses
          the original Tekelec CANAR bit-level encoding, the Formatter enriches
          with site metadata, and the WebSocket-out pushes JSON straight to the
          dashboard.
        </p>

        <p>
          The binary protocol itself is faithful to the original hardware:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 text-xs sm:text-sm rounded-lg p-4 overflow-x-auto leading-relaxed">
{`byte[0]       = model (TEK 733 / 766 / 586 / 790 / 822 / 643)
byte[1]       = HW revision
byte[2]       = SW version (minor.major)
byte[3]       = reason flags (refill / drop / reboot / alarm / ...)
byte[4]       = alarm flags
byte[5]       = GSM signal
byte[6]       = battery (act_3g + RTC_set + voltage)
byte[7..14]   = IMEI as BCD (8 bytes, hex = 2 decimal digits each)
byte[26..137] = up to 28 historical readings, 4 bytes each
                  byte[0]  Ultrasonic RSSI
                  byte[1]  temperature ((b / 2) - 30)
                  byte[2]  SRC (4 bits) + cm high 2 bits
                  byte[3]  cm low 8 bits`}
        </pre>
      </Section>

      {/* Original vs rebuild */}
      <Section title="The original system, for reference">
        <p>
          The 2023 production deployment had:
        </p>
        <ul className="list-disc list-inside space-y-1 text-zinc-700">
          <li>2 live tanks (SOBA2 in Khartoum, plus a test device)</li>
          <li>Tekelec CANAR ultrasonic sensors with GSM/3G modems</li>
          <li>Node-RED on a VPS, processing incoming TCP packets on port 5050</li>
          <li>ThingsBoard CE for the customer dashboard</li>
          <li>MySQL for historical data persistence</li>
          <li>Email alerts (to Canar staff) and SMS alerts (to Sudanese numbers) via Mazinhost API</li>
        </ul>
        <p>
          The original ThingsBoard dashboard had 3 pages and 20+ widgets. This
          rebuild preserves the visual language: identical color palette
          (
          <ColorSwatch hex="#2369a7" /> <code className="text-xs">#2369a7</code> ·{' '}
          <ColorSwatch hex="#23b832" /> <code className="text-xs">#23b832</code> ·{' '}
          <ColorSwatch hex="#efab16" /> <code className="text-xs">#efab16</code> ·{' '}
          <ColorSwatch hex="#ed0a0a" /> <code className="text-xs">#ed0a0a</code>
          ), same gauge thresholds (red 0–25%, yellow 25–50%, green 50–100%),
          same chart styling (dark blue grid + bright green line for volume).
        </p>
      </Section>

      {/* Tech stack */}
      <Section title="Tech stack">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose">
          <StackCard title="Backend" items={['Node-RED (flow-based)', 'WebSocket egress (replacing the lost ThingsBoard MQTT)']} />
          <StackCard title="Frontend" items={['Next.js 16 (App Router, static export)', 'React 19', 'Tailwind CSS 4', 'Leaflet + react-leaflet', 'Recharts (timeseries)', 'Lucide React (icons)']} />
          <StackCard title="Hosting" items={['Netlify (static)', 'No server runtime required']} />
          <StackCard title="Original sensors" items={['Tekelec CANAR ultrasonic', 'TEK 733 / 766 / 586 / 790 / 822 / 643 family', 'GSM/3G uplink', '140-byte binary protocol']} />
        </div>
      </Section>

      {/* Why a faithful rebuild */}
      <Section title="Why a faithful rebuild (not a simplified mock)">
        <p>
          I kept the entire 140-byte binary protocol. The simulator generates
          real binary buffers; the decoder is a TypeScript port of the original
          bit-level Node-RED function. If real hardware came back online
          tomorrow, the same Node-RED ingress and decoder would parse those
          packets — no changes needed.
        </p>
        <p>
          That faithfulness is the point. Most &quot;IoT dashboards&quot; you
          see in portfolios are{' '}
          <code className="text-xs px-1 py-0.5 bg-zinc-100 rounded">
            mqtt.publish(&apos;temp&apos;, value)
          </code>
          . This one carries the weight of a real protocol that real customers
          paid for.
        </p>
      </Section>

      {/* Built at GTS Hi-Tech */}
      <Section title="Built at GTS Hi-Tech">
        <div className="bg-white border border-zinc-200 rounded-lg p-5 not-prose">
          <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
            <a
              href="https://gts-hitech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 block bg-zinc-50 border border-zinc-200 rounded-md p-3 hover:border-canar-blue/40 transition-colors"
            >
              <Image
                src="/gts-logo.png"
                alt="GTS Hi-Tech"
                width={72}
                height={70}
                className="block"
              />
            </a>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-zinc-900 text-lg">GTS Hi-Tech</h3>
                <span className="text-xs text-zinc-500">(formerly Gezira Telecom Solutions)</span>
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed mt-1.5">
                ICT solutions provider operating across <strong>Sudan</strong>,{' '}
                <strong>UAE</strong>, and <strong>South Sudan</strong>. GTS
                specializes in networking, IoT, cybersecurity, CCTV, cloud
                infrastructure, and solar power for enterprise clients across
                East Africa and the Gulf.
              </p>
              <p className="text-sm text-zinc-700 leading-relaxed mt-2">
                I was on the GTS team as <strong>System Administrator and IoT
                / Software Developer</strong>, and I designed, built, and
                maintained the original Canar fuel monitoring system end-to-end
                — sensor integration, Node-RED backend, ThingsBoard dashboard,
                and on-site deployment. I continue to collaborate with GTS on
                projects on a freelance basis.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <a
                  href="https://gts-hitech.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-canar-blue hover:underline"
                >
                  <Globe className="size-3.5" />
                  gts-hitech.com
                </a>
                <span className="text-xs text-zinc-400">·</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                  <Building2 className="size-3.5" />
                  Dubai · Khartoum · Juba
                </span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* About me */}
      <Section title="About me">
        <p>
          I&apos;m <strong>Babakr Hussain Babakr Saad</strong>. I built the
          original Canar system as the{' '}
          <strong>System Administrator and IoT / Software Developer</strong> at{' '}
          <a
            href="https://gts-hitech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-canar-blue hover:underline"
          >
            GTS Hi-Tech
          </a>
          {' '}in Sudan, and I still collaborate with them on projects today. I
          now also work in Saudi Arabia as an IT &amp; Tendering Coordinator at
          Naif Obaid Al-Shammari Contracting Establishment, while continuing to
          develop software on the side.
        </p>
        <div className="flex flex-wrap gap-3 pt-2 not-prose">
          <ContactLink href="mailto:beko1986@gmail.com" icon={<Mail className="size-4" />} label="beko1986@gmail.com" />
          <ContactLink href="https://beko-cloud.work" icon={<Globe className="size-4" />} label="beko-cloud.work" />
          <ContactLink href="https://github.com/bekoblast/fuel-tanker-monitor" icon={<Code className="size-4" />} label="Source on GitHub" />
        </div>
      </Section>

      {/* CTA */}
      <div className="border-t border-zinc-200 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-canar-blue text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-canar-blue/90 transition-colors"
        >
          Back to the live dashboard
          <ExternalLink className="size-4" />
        </Link>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
      <div className="text-zinc-700 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function Callout({ color, title, children }: { color: 'blue' | 'green'; title: string; children: React.ReactNode }) {
  const bg = color === 'blue' ? 'bg-canar-blue/5 border-canar-blue/30' : 'bg-canar-green/5 border-canar-green/30';
  const dot = color === 'blue' ? 'bg-canar-blue' : 'bg-canar-green';
  const txt = color === 'blue' ? 'text-canar-blue' : 'text-canar-green';
  return (
    <div className={`border ${bg} rounded-lg p-4`}>
      <div className={`flex items-center gap-2 font-semibold ${txt} mb-2`}>
        <span className={`size-2 rounded-full ${dot} live-dot`} />
        {title}
      </div>
      <div className="text-zinc-700 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function StackCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">{title}</div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="text-sm text-zinc-700 flex items-start gap-2">
            <span className="text-canar-blue mt-1.5 size-1 rounded-full bg-canar-blue inline-block shrink-0" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm text-zinc-700 hover:text-canar-blue border border-zinc-200 hover:border-canar-blue/40 rounded-md px-3 py-1.5 bg-white transition-colors"
    >
      {icon}
      {label}
    </a>
  );
}

function ColorSwatch({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block size-3 rounded-sm align-middle border border-black/10"
      style={{ background: hex }}
    />
  );
}
