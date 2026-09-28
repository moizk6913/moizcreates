'use client';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999999] bg-[#0c0c0e] text-white flex flex-col justify-between p-6 sm:p-10 md:p-14 select-none pointer-events-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between text-xs font-mono tracking-widest uppercase text-neutral-400">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="font-bold text-white tracking-wider">MOIZ KHAN</span>
        </div>
        <span className="text-neutral-500 font-mono text-[11px] tracking-widest">
          PORTFOLIO ARCHIVE
        </span>
      </div>

      {/* Center Stage: The Hero Animated GIF Loading Showcase */}
      <div className="my-auto flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative w-[85vw] max-w-[420px] aspect-[16/9] bg-white rounded-3xl p-3 sm:p-5 shadow-[0_25px_80px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden border border-white/20">
          <img
            src="/frame-13.gif"
            alt="Loading animation"
            className="w-full h-full object-contain select-none pointer-events-none"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://eztcznarhdmpfurrtbgx.supabase.co/storage/v1/object/public/portfolio-media/images/Frame_13.gif';
            }}
          />
        </div>

        <div className="w-[85vw] max-w-[280px] flex flex-col items-center space-y-3">
          <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 bg-white w-2/3 rounded-full animate-pulse" />
          </div>
          <span className="text-neutral-400 font-mono text-xs tracking-widest uppercase">
            LOADING...
          </span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
        <span>DIRECTORIAL ARCHIVE</span>
        <span>HYDERABAD // WORLDWIDE</span>
      </div>
    </div>
  );
}
