export default function About() {
  return (
    <section id="about" className="w-full py-24 md:py-32 bg-subtle border-b border-border-hairline">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
          
          <div className="md:col-span-5">
            <span className="font-mono text-xs text-accent-red tracking-wider block mb-2">02 / PROFILE</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
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

            <div className="flex flex-wrap gap-2 pt-2">
              {['Shoot Direction', 'Brand Systems', 'Commercial Treatment', 'Lighting Direction', 'Editorial Styling'].map((skill) => (
                <span
                  key={skill}
                  className="font-mono text-xs px-3 py-1.5 bg-canvas border border-border-hairline text-secondary"
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
