"use client";

import React, { useEffect, useState } from 'react';

interface DesktopSource {
  id: string;
  name: string;
  thumbnail: string;
}

interface ScreenPickerModalProps {
  onSelect: (sourceId: string, shareAudio: boolean) => void;
  onClose: () => void;
}

export default function ScreenPickerModal({ onSelect, onClose }: ScreenPickerModalProps) {
  const [sources, setSources] = useState<DesktopSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareAudio, setShareAudio] = useState(true);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        if (window.electron && window.electron.getSources) {
          const res = await window.electron.getSources();
          setSources(res);
        }
      } catch (err) {
        console.error('Kaynaklar alınamadı:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSources();
  }, []);

  const filteredSources = sources.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'screen') return s.id.startsWith('screen:');
    if (filter === 'window') return s.id.startsWith('window:');
    return true;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="glass-card w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col z-10 animate-scale-in rounded-[3rem] border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        <div className="p-10 border-b border-white/5 flex items-center justify-between relative overflow-hidden">
          {/* Decorative light */}
          <div className="absolute top-0 left-1/4 w-32 h-1 bg-blue-500/50 blur-xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white tracking-tighter items-center flex gap-4">
              <span className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl">📡</span>
              Yayın Başlat
            </h2>
            <p className="text-sm text-slate-400 font-bold mt-2 uppercase tracking-[0.2em] opacity-60">Paylaşmak istediğiniz pencereyi seçin</p>
          </div>
          <button onClick={onClose} className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 flex items-center justify-center transition-all text-slate-400 group relative z-10">
            <svg className="w-7 h-7 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="px-10 py-6 bg-white/2 flex gap-4 border-b border-white/5 overflow-x-auto custom-scrollbar-horizontal no-scrollbar">
          <button 
            onClick={() => setFilter('all')}
            className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === 'all' ? 'bg-white text-[#0f172a] shadow-xl shadow-white/10 scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5 border border-white/5'}`}
          >
            Tüm Kaynaklar
          </button>
          <button 
            onClick={() => setFilter('screen')}
            className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === 'screen' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5 border border-white/5'}`}
          >
            Ekranlar
          </button>
          <button 
            onClick={() => setFilter('window')}
            className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === 'window' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5 border border-white/5'}`}
          >
            Pencereler
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 border-8 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🔭</div>
              </div>
              <span className="font-black tracking-[0.3em] uppercase text-sm text-blue-500/80 animate-pulse">Sistem Taranıyor</span>
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-500 bg-white/2 rounded-[2.5rem] border-2 border-dashed border-white/5">
              <span className="text-5xl mb-2">🌑</span>
              <span className="font-black uppercase tracking-widest text-xs">Seçili kategoride kaynak bulunamadı</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => onSelect(source.id, shareAudio)}
                  className="group flex flex-col gap-4 p-5 rounded-[2.5rem] bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-blue-500/40 transition-all text-left relative overflow-hidden"
                >
                  <div className="aspect-video rounded-[1.8rem] overflow-hidden bg-black relative border border-white/10 shadow-2xl group-hover:scale-[1.03] transition-all duration-500">
                    <img 
                      src={source.thumbnail} 
                      alt={source.name} 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity grayscale-[30%] group-hover:grayscale-0 duration-500" 
                    />
                    <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                       <div className="bg-white text-[#0f172a] px-8 py-3 rounded-2xl font-black text-xs tracking-[0.2em] transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-2xl shadow-blue-500/50">SEÇ VE BAŞLAT</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse group-hover:scale-150 transition-transform"></div>
                    <span className="text-sm font-black text-slate-200 truncate group-hover:text-white transition-colors tracking-tight">
                      {source.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-8 border-t border-white/5 bg-white/3 flex justify-between items-center">
           <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-6">
             <span>Toplam {filteredSources.length} Kaynak Bulundu</span>
             
             {/* Sesi Paylaş Toggle */}
             <label className="flex items-center gap-3 cursor-pointer group">
               <div className="relative">
                 <input type="checkbox" className="sr-only" checked={shareAudio} onChange={(e) => setShareAudio(e.target.checked)} />
                 <div className={`block w-12 h-7 rounded-full transition-colors ${shareAudio ? 'bg-blue-500' : 'bg-white/10'}`}></div>
                 <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${shareAudio ? 'transform translate-x-5' : ''}`}></div>
               </div>
               <span className={`text-xs tracking-widest font-black uppercase transition-colors ${shareAudio ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'}`}>
                 Sistem Sesini Paylaş
               </span>
             </label>
           </div>
           <button onClick={onClose} className="px-10 py-4 rounded-2.5xl text-xs font-black text-slate-400 hover:text-white transition-all tracking-widest bg-white/5 hover:bg-white/10">VAZGEÇ</button>
        </div>
      </div>
    </div>
  );
}
