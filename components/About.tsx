export default function About() {
  return (
    <section
      id="about"
      className="w-full py-24 md:py-32 bg-gradient-to-b from-canvas via-[#faf9f6] to-[#f4f2ee] relative overflow-hidden"
    >
      {/* Ambient luxury accent glow (Zero harsh lines, subtle gradient atmosphere) */}
      <div
        className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,42,42,0.035)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col gap-6 items-start">
          
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e60000]" />
            <span className="font-mono text-xs text-[#e60000] tracking-widest font-semibold uppercase">
              02 // DIRECTOR NOTE
            </span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase tracking-tight leading-[1.15] text-primary">
            I WAS GOING TO WRITE SOMETHING IMPRESSIVE HERE.<br />
            THEN I REMEMBERED YOU&apos;VE ALREADY SCROLLED THIS FAR.<br />
            SO I GUESS THE WORK DID ITS JOB.<br />
            GOOD. <span className="text-[#e60000]">LET&apos;S TALK.</span>
          </h2>

          {/* Tactile borderless skill pills with smooth hover */}
          <div className="flex flex-wrap gap-2.5 pt-4">
            {['Shoot Direction', 'Brand Systems', 'Commercial Treatment', 'Lighting Direction', 'Editorial Styling'].map((skill) => (
              <span
                key={skill}
                className="font-mono text-xs px-4 py-2 rounded-full bg-black/[0.035] hover:bg-black/[0.07] hover:text-primary transition-all duration-300 text-secondary select-none"
              >
                {skill}
              </span>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
