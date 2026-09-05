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

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
          
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
              <span className="font-mono text-xs text-accent-red tracking-widest font-semibold uppercase">
                02 // PROFILE
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-primary leading-tight">
              Art Director & Brand Visual Designer<span className="text-accent-red">.</span>
            </h2>
          </div>

          <div className="md:col-span-7 flex flex-col gap-5">
            <p className="text-lg md:text-xl font-medium text-primary leading-relaxed">
              I started in design and stayed behind the camera. Close to six years building brand and directing the work that carries vision, talent, edit, grade.
            </p>
            <p className="text-sm md:text-base text-secondary leading-relaxed">
              I've led teams of up to four, working direct with founders. Quiet in pre-prod, decisive on set. Built out camera and lighting fluency to direct cinematographers with technical precision rather than giving vague prompts.
            </p>
            <p className="text-sm md:text-base text-secondary leading-relaxed">
              Targeting Director and Content Lead roles at production houses in Dubai and select international commercial projects.
            </p>

            {/* Tactile borderless skill pills with smooth gradient hover */}
            <div className="flex flex-wrap gap-2 pt-3">
              {['Shoot Direction', 'Brand Systems', 'Commercial Treatment', 'Lighting Direction', 'Editorial Styling'].map((skill) => (
                <span
                  key={skill}
                  className="font-mono text-xs px-3.5 py-1.5 rounded-full bg-black/[0.035] hover:bg-black/[0.07] hover:text-primary transition-all duration-300 text-secondary select-none"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
