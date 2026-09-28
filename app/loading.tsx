'use client';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999999] bg-[#f7f7f7] flex items-center justify-center p-4 sm:p-8 select-none pointer-events-auto">
      <div className="relative w-[92vw] max-w-[580px] sm:max-w-[680px] md:max-w-[760px] aspect-[1023/575] flex items-center justify-center">
        <img
          src="/frame-13.gif"
          alt="Loading"
          className="w-full h-full object-contain select-none pointer-events-none"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://eztcznarhdmpfurrtbgx.supabase.co/storage/v1/object/public/portfolio-media/images/Frame_13.gif';
          }}
        />
      </div>
    </div>
  );
}
