import { Image } from "@nextui-org/react";
import { Divider } from "@nextui-org/divider";

interface Props {
  children: React.ReactNode;
}

export const AuthLayoutWrapper = ({ children }: Props) => {
  return (
    <div className='flex h-screen bg-[#0A0A0A] overflow-hidden relative font-sans'>
      {/* Background ambient light */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className='flex-1 flex-col flex items-center justify-center p-6 z-10'>
        {children}
      </div>

      <div className='hidden my-10 md:block z-10 opacity-20'>
        <Divider orientation='vertical' />
      </div>

      <div className='hidden md:flex flex-1 relative flex items-center justify-center p-6 z-10'>
        <div className='max-w-[440px] flex flex-col gap-6 text-white'>
          <div className='flex items-center gap-4'>
            <img
              src="/logo.png"
              alt="Logo Allia"
              className="h-16 w-16 object-contain rounded-2xl shadow-lg border border-white/10 p-1 bg-black/20"
            />
            <div className="flex flex-col">
              <h1 className='font-black text-[38px] leading-tight tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent'>
                Allia FPA
              </h1>
              <span className="text-xs text-primary font-bold uppercase tracking-widest -mt-1">
                Portal Analisis Biometrik
              </span>
            </div>
          </div>
          <p className='font-light text-slate-400 leading-relaxed text-sm'>
            Sistem analisis sidik jari biometrik dan verifikasi identitas terpadu. Masuk untuk mengelola data pemindaian, verifikasi kelayakan, sinkronisasi DB, serta monitoring performa secara realtime.
          </p>

          {/* Telemetry Stats Widget */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Engine API</span>
              <span className="text-xl font-bold text-success mt-1">98% Optimal</span>
            </div>
            <div className="flex flex-col p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Clarity Rate</span>
              <span className="text-xl font-bold text-secondary mt-1">92% Ready</span>
            </div>
            <div className="flex flex-col p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md col-span-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Database Sync</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-semibold text-success">Terhubung & Sinkron</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
