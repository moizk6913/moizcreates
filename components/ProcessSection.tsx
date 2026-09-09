'use client';

const STEPS = [
  {
    step: '01',
    phase: 'PHASE 01',
    title: 'Discovery & Visual Treatment',
    summary:
      'Before a single camera rolls or a frame is laid out, we architect the conceptual DNA of your campaign.',
    description:
      'We deconstruct your core objectives, target demographics, and brand codes. We translate abstract founder ideas into a bulletproof Directorial Treatment: moodboards, lens and lighting schemes, casting profiles, and minute-by-minute shotlists that eliminate on-set guesswork.',
    bullets: [
      'Narrative & Concept Alignment',
      'Atmospheric Lighting & Color Palettes',
      'Comprehensive Treatment Decks',
      'Shotlist & Framing Blueprints',
    ],
  },
  {
    step: '02',
    phase: 'PHASE 02',
    title: 'Production & On-Set Direction',
    summary:
      'High-discipline on-set execution where creative vision turns into tangible, high-resolution reality.',
    description:
      'On set, every frame is crafted with obsessive attention to light, shadow, model posture, and lens perspective. We direct talent, coordinate lighting packages, and monitor multiple aspect ratios (16:9, 4:5, and 9:16) simultaneously so every channel is covered in a single shoot.',
    bullets: [
      'Directorial Leadership On-Set',
      'Tactile Lighting & Practical Haze Control',
      'Simultaneous Multi-Aspect Framing',
      'High-Paced Scene & Talent Coordination',
    ],
  },
  {
    step: '03',
    phase: 'PHASE 03',
    title: 'Master Finish & Campaign Rollout',
    summary:
      'Where raw capture transforms into iconic, high-retention commercial art ready for global release.',
    description:
      'Post-production is treated with surgical precision. We execute rhythmic, heartbeat-paced edits, immersive sound design, and bespoke 35mm film stock color grading. Final deliverables are packaged with launch-ready specs for digital, broadcast, and luxury print.',
    bullets: [
      'Anamorphic Director’s Cut Commercial Edits',
      '35mm Film Grain & Skin-Tone Mastering',
      '9:16 Paid Social & 16:9 Broadcast Exports',
      'High-Res Archival Cloud Handoff',
    ],
  },
];

export default function ProcessSection() {
  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 md:px-12 bg-subtle/50 border-t border-border-hairline">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-hairline">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-accent-red font-bold tracking-widest uppercase mb-2">
              <span>●</span>
              <span>THE DIRECTORIAL FRAMEWORK</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-primary tracking-tight uppercase leading-[0.95]">
              HOW WE WORK
            </h2>
          </div>
          <p className="max-w-md text-secondary font-mono text-xs leading-relaxed">
            A three-phase commercial methodology built for zero friction, complete transparency, and uncompromising cinematic standards from initial brief to global launch.
          </p>
        </div>

        {/* 3 Step Process Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {STEPS.map((s, idx) => (
            <div
              key={idx}
              className="bg-canvas border border-border-hairline rounded-[14px] p-6 sm:p-8 flex flex-col justify-between space-y-8 hover:border-primary transition-all duration-300 shadow-xs group"
            >
              <div className="space-y-6">
                {/* Step Pill & Monospace Number */}
                <div className="flex justify-between items-center border-b border-border-hairline pb-4">
                  <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-border-hairline text-secondary uppercase font-bold tracking-wider">
                    {s.phase}
                  </span>
                  <span className="font-display font-black text-3xl text-muted group-hover:text-accent-red transition-colors">
                    {s.step}
                  </span>
                </div>

                {/* Title & Summary */}
                <div className="space-y-2">
                  <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-primary leading-tight">
                    {s.title}
                  </h3>
                  <p className="font-mono text-xs text-accent-red font-semibold">
                    {s.summary}
                  </p>
                </div>

                {/* Full Description */}
                <p className="text-sm text-secondary leading-relaxed">
                  {s.description}
                </p>
              </div>

              {/* Pillars list */}
              <div className="pt-4 border-t border-border-hairline">
                <span className="font-mono text-[10px] text-muted tracking-widest uppercase block mb-3 font-bold">
                  KEY MILESTONES:
                </span>
                <ul className="space-y-2 font-mono text-xs text-primary">
                  {s.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-accent-red mt-0.5">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
