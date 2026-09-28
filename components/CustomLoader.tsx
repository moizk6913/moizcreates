'use client';

interface CustomLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  caption?: string;
  className?: string;
}

export default function CustomLoader({
  size = 'md',
  caption = 'Loading...',
  className = '',
}: CustomLoaderProps) {
  const sizeClasses = {
    sm: 'w-20 sm:w-28',
    md: 'w-36 sm:w-48',
    lg: 'w-52 sm:w-64',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 text-center select-none ${className}`}>
      <div className={`relative aspect-[16/9] ${sizeClasses[size]} overflow-hidden flex items-center justify-center`}>
        <img
          src="/frame-13.gif"
          alt="Loading animation"
          className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(255,255,255,0.06)]"
        />
      </div>
      {caption && (
        <span className="mt-2 font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-400">
          {caption}
        </span>
      )}
    </div>
  );
}
