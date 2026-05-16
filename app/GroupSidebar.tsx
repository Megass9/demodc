"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLocalParticipant, MediaDeviceMenu, useParticipants, useIsSpeaking } from '@livekit/components-react';
import { useKrispNoiseFilter } from '@livekit/components-react/krisp';
import { Participant } from 'livekit-client';
import ScreenPickerModal from './ScreenPickerModal';

interface GroupSidebarProps {
  username: string;
  activeChannel: 'chat' | 'voice';
  onChannelSelect: (channel: 'chat' | 'voice') => void;
  isInVoice: boolean;
  onLeaveVoice: () => void;
}

const DEFAULT_SCREEN_SHARE_QUALITY = 'auto';

function getScreenShareResolution(quality: string) {
  switch (quality) {
    case '1080p60': return { width: 1920, height: 1080, frameRate: 60 };
    case '1080p30': return { width: 1920, height: 1080, frameRate: 30 };
    case '720p30': return { width: 1280, height: 720, frameRate: 30 };
    case '480p30': return { width: 854, height: 480, frameRate: 30 };
    default: return { width: 1280, height: 720, frameRate: 15 };
  }
}

function ParticipantItem({ participant }: { participant: Participant }) {
  const isSpeaking = useIsSpeaking(participant);
  
  // LiveKit'in VAD (Voice Activity Detection) sistemine doğrudan bağlanıyoruz.
  // Bu sayede tam konuşulduğu milisaniyede ışık yanar.
  const isActuallySpeaking = isSpeaking;
  
  return (
    <div key={participant.sid} className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/5 transition-all group/user">
      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-500/10 
        ${isActuallySpeaking ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#0f172a] scale-110' : 'transition-transform group-hover/user:scale-105'}`}>
        {participant.identity ? participant.identity.charAt(0).toUpperCase() : '?'}
      </div>
      <div className="flex flex-col min-w-0">
        <span className={`text-sm font-bold truncate ${isActuallySpeaking ? 'text-emerald-400' : 'text-slate-200'}`}>
          {participant.identity}
        </span>
      </div>
      {!participant.isMicrophoneEnabled && (
        <div className="ml-auto w-6 h-6 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 scale-75">
          <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d="M12 2c1.66 0 3 1.34 3 3v7c0 1.66-1.34 3-3 3s-3-1.34-3-3V5c0-1.66 1.34-3 3-3zm7 10h-1.7c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.41 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72z" /><path d="M4.41 2.86L3 4.27l16.73 16.73 1.41-1.41L4.41 2.86z" /></svg>
        </div>
      )}
    </div>
  );
}

function MicToggle() {
  const { localParticipant } = useLocalParticipant();
  const isMicrophoneEnabled = localParticipant?.isMicrophoneEnabled ?? false;
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={!localParticipant}
      className={`p-2 rounded-xl transition-all active:scale-90 ${
        !localParticipant 
          ? 'opacity-50 cursor-wait text-slate-500' 
          : isMicrophoneEnabled 
            ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-lg shadow-emerald-500/10' 
            : 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
      }`}
      title={isMicrophoneEnabled ? 'Mikrofonu Kapat' : 'Mikrofonu Aç'}
    >
      {isMicrophoneEnabled ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
      )}
    </button>
  )
}

function CameraToggle() {
  const { localParticipant } = useLocalParticipant();
  const isCameraEnabled = localParticipant?.isCameraEnabled ?? false;
  
  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localParticipant) {
      try {
        await localParticipant.setCameraEnabled(!isCameraEnabled);
      } catch (err) {
        console.error('Kamera hatası:', err);
      }
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={!localParticipant}
      className={`p-2 rounded-xl transition-all active:scale-90 ${
        !localParticipant 
          ? 'opacity-50 cursor-wait text-slate-500' 
          : isCameraEnabled 
            ? 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 shadow-lg shadow-blue-500/10' 
            : 'text-slate-400 bg-white/5 hover:bg-white/10'
      }`}
      title={isCameraEnabled ? 'Kamerayı Kapat' : 'Kamerayı Aç'}
    >
      {isCameraEnabled ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
      )}
    </button>
  )
}

function ScreenShareToggle() {
  const { localParticipant } = useLocalParticipant();
  const isScreenShareEnabled = localParticipant?.isScreenShareEnabled ?? false;
  const [showPicker, setShowPicker] = useState(false);
  
  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!localParticipant) {
      console.warn('HandleToggle: No local participant');
      return;
    }

    const isElectron = typeof window !== 'undefined' && !!(window as unknown as { electron?: unknown }).electron;
    console.log('HandleToggle: isElectron:', isElectron, 'isEnabled:', isScreenShareEnabled);
    
    if (isElectron && !isScreenShareEnabled) {
      setShowPicker(true);
      return;
    }

    try {
      console.log('Toggling screen share...');
      const savedQuality = localStorage.getItem('screenShareQuality') || DEFAULT_SCREEN_SHARE_QUALITY;
      const resolution = getScreenShareResolution(savedQuality);

      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled, { 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        ...(resolution ? { resolution } : {})
      });
    } catch (err) {
      console.error('Ekran paylaşımı hatası:', err);
    }
  };

  const handleSourceSelect = async (sourceId: string, shareAudio: boolean) => {
    console.log('Source selected:', sourceId, 'shareAudio:', shareAudio);
    setShowPicker(false);
    if (!localParticipant) return;

    try {
      console.log('Setting source in Electron...');
      await window.electron.setSource(sourceId, shareAudio);
      
      const savedQuality = localStorage.getItem('screenShareQuality') || DEFAULT_SCREEN_SHARE_QUALITY;
      const resolution = getScreenShareResolution(savedQuality);

      console.log('Enabling screen share in LiveKit with resolution:', resolution);
      await localParticipant.setScreenShareEnabled(true, { 
        audio: shareAudio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false,
        ...(resolution ? { resolution } : {})
      });
    } catch (err) {
      console.error('Ekran paylaşımı başlatılamadı:', err);
    }
  };

  return (
    <>
      <button 
        onClick={handleToggle}
        disabled={!localParticipant}
        className={`p-2 rounded-xl transition-all active:scale-90 ${
          !localParticipant 
            ? 'opacity-50 cursor-wait text-slate-500' 
            : isScreenShareEnabled 
              ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 shadow-lg shadow-indigo-500/10' 
              : 'text-slate-400 bg-white/5 hover:bg-white/10'
        }`}
        title={isScreenShareEnabled ? 'Ekran Paylaşımını Durdur' : 'Ekran Paylaş'}
      >
        {isScreenShareEnabled ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M2 3h20v14H2z"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="3" y1="3" x2="21" y2="17"/></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        )}
      </button>

      {showPicker && (
        <ScreenPickerModal 
          onSelect={handleSourceSelect} 
          onClose={() => setShowPicker(false)} 
        />
      )}
    </>
  );
}

export default function GroupSidebar({ username, activeChannel, onChannelSelect, isInVoice, onLeaveVoice }: GroupSidebarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const participants = useParticipants().filter(p => !p.identity.startsWith('izleyici-'));
  const krisp = useKrispNoiseFilter();
  const [screenQuality, setScreenQuality] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_SCREEN_SHARE_QUALITY;
    return localStorage.getItem('screenShareQuality') || DEFAULT_SCREEN_SHARE_QUALITY;
  });

  const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setScreenQuality(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('screenShareQuality', val);
      window.dispatchEvent(new Event('screenShareQualityChanged'));
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && isInVoice && !krisp.isNoiseFilterPending) {
      const savedState = localStorage.getItem('krispEnabled') === 'true';
      // Eğer kullanıcı daha önce açtıysa ve şu an kapalıysa otomatik aç
      if (savedState && !krisp.isNoiseFilterEnabled) {
        krisp.setNoiseFilterEnabled(true).catch(() => {
          // Bazı durumlarda mikrofon henüz hazır olmadığı için hata verebilir, 
          // useEffect tekrar tetiklendiğinde zaten tekrar deneyecektir.
        });
      }
    }
  }, [isInVoice, krisp.isNoiseFilterPending, krisp.isNoiseFilterEnabled, krisp]);

  return (
    <div className="w-[300px] panel border-r border-border-subtle flex flex-col shrink-0 overflow-hidden z-20 transition-all duration-300">
      <div className="h-16 flex items-center px-4 font-bold tracking-tight text-[15px] text-foreground border-b border-border-subtle shadow-sm bg-background-secondary/50 shimmer-container">
        Seni <span className="text-accent-primary mx-1">Çok Seviyorum</span> Aslı
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar pt-8">
        {/* Metin Kanalları */}
        <div>
          <div className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mb-4 flex items-center px-2">
            Metin Kanalları
            <span className="ml-auto w-4 h-4 rounded bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">+</span>
          </div>
          <div 
            onClick={() => onChannelSelect('chat')}
            className={`stagger-item group px-3 py-2 rounded-md cursor-pointer flex items-center font-medium transition-all duration-300 mb-1 ${
              activeChannel === 'chat' 
                ? 'bg-background-tertiary text-foreground active-glow' 
                : 'text-foreground-muted hover:bg-background-tertiary/50 hover:text-foreground'
            }`}
            style={{ animationDelay: '0.1s' }}
          >
            <span className="text-[18px] mr-2 text-foreground-muted opacity-70">#</span> 
            sohbet
          </div>
        </div>

        {/* Ses Kanalları */}
        <div>
          <div className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mb-4 flex items-center px-2">
            Ses Kanalları
            <span className="ml-auto w-4 h-4 rounded bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">+</span>
          </div>
          <div 
            onClick={() => onChannelSelect('voice')}
            className={`stagger-item group px-3 py-2 rounded-md cursor-pointer flex items-center font-medium transition-all duration-300 mb-1 ${
              activeChannel === 'voice' 
                ? 'bg-background-tertiary text-foreground active-glow' 
                : 'text-foreground-muted hover:bg-background-tertiary/50 hover:text-foreground'
            }`}
            style={{ animationDelay: '0.2s' }}
          >
            <span className="mr-2 text-[16px] text-foreground-muted opacity-70">🔊</span> 
            Genel Ses
          </div>
          
          {/* Ses Kanalına Bağlı Dinamik Kullanıcı Listesi */}
          {participants.length > 0 && (
            <div className="pl-6 pr-2 mt-4 space-y-2">
              {participants.map((p, index) => (
                <div key={p.sid} className="stagger-item" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                  <ParticipantItem participant={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Sese Bağlı Durumu Bildirimi */}
      {isInVoice && (
        <div className="m-4 mt-0 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex flex-col shrink-0 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping absolute inset-0"></div>
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full relative"></div>
              </div>
              <span className="text-emerald-400 text-sm font-black tracking-tight">SESE BAĞLI</span>
            </div>
            <button 
              onClick={onLeaveVoice} 
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90" 
              title="Aramadan Ayrıl"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col min-w-0">
               <span className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest whitespace-nowrap">Aktif Kanal</span>
               <span className="text-emerald-200 text-xs font-bold truncate">Genel Ses</span>
            </div>
            <div className="flex items-center gap-2">
              <CameraToggle />
              <ScreenShareToggle />
              <MicToggle />
            </div>
          </div>
        </div>
      )}

      {/* Profil Paneli */}
      <div className="p-3 bg-background-secondary border-t border-border-subtle flex items-center gap-2 shrink-0">
        <div className="w-9 h-9 bg-background-tertiary rounded-full relative cursor-pointer flex-shrink-0 flex items-center justify-center text-foreground font-bold text-sm">
           {username.charAt(0).toUpperCase()}
           <div className="absolute bottom-[-1px] right-[-1px] w-3.5 h-3.5 bg-success border-2 border-background-secondary rounded-full"></div>
        </div>
        <div className="flex-1 overflow-hidden ml-1">
          <div className="text-sm font-bold text-foreground truncate">{username}</div>
          <div className="text-[11px] text-foreground-muted">Çevrimiçi</div>
        </div>
        
        <button 
          onClick={() => setShowSettings(true)} 
          className="w-8 h-8 flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-background-tertiary rounded-md transition-colors" 
          title="Ayarlar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </button>
      </div>

      {/* Ayarlar Modalı (Popup) */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowSettings(false)}>
          <div className="bg-background rounded-xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden border border-border-subtle" data-lk-theme="default" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-background-secondary">
              <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Kullanıcı Ayarları</h2>
                <p className="text-foreground-muted text-xs mt-1">Hesap ve Cihaz Yönetimi</p>
              </div>
              <button 
                onClick={() => setShowSettings(false)} 
                className="w-8 h-8 flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-background-tertiary transition-colors rounded-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[65vh] overflow-y-auto custom-scrollbar bg-background">
              <div className="space-y-3">
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider ml-1 flex items-center gap-2">
                   <span className="w-5 h-5 rounded bg-accent-primary/10 text-accent-primary flex items-center justify-center text-[10px]">⚙️</span> Ekran Paylaşım Kalitesi
                </label>
                <div className="panel rounded-xl p-4 transition-colors hover:border-accent-primary/50 flex flex-col">
                  <select 
                    value={screenQuality} 
                    onChange={handleQualityChange}
                    className="w-full bg-background-secondary border border-border-subtle text-foreground p-2.5 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent-primary focus:border-accent-primary outline-none cursor-pointer"
                  >
                    <option value="auto">Otomatik (İnternet Hızına Göre)</option>
                    <option value="1080p60">1080p 60FPS (Maksimum Akıcılık)</option>
                    <option value="1080p30">1080p 30FPS (Yüksek Kalite - Önerilen)</option>
                    <option value="720p30">720p 30FPS (Standart)</option>
                    <option value="480p30">480p 30FPS (Düşük İnternet / Tasarruf)</option>
                  </select>
                </div>
              </div>

              {isInVoice ? (
                <>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider ml-1 flex items-center gap-2">
                       <span className="w-5 h-5 rounded bg-background-tertiary flex items-center justify-center text-[10px]">1</span> Mikrofon Girişi
                    </label>
                    <div className="panel rounded-xl p-4 transition-colors hover:border-accent-primary/50">
                      <MediaDeviceMenu kind="audioinput" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider ml-1 flex items-center gap-2">
                       <span className="w-5 h-5 rounded bg-background-tertiary flex items-center justify-center text-[10px]">2</span> Hoparlör Çıkışı
                    </label>
                    <div className="panel rounded-xl p-4 transition-colors hover:border-accent-primary/50">
                      <MediaDeviceMenu kind="audiooutput" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider ml-1 flex items-center gap-2">
                       <span className="w-5 h-5 rounded bg-background-tertiary flex items-center justify-center text-[10px]">3</span> Video Kaynağı
                    </label>
                    <div className="panel rounded-xl p-4 transition-colors hover:border-accent-primary/50">
                      <MediaDeviceMenu kind="videoinput" />
                    </div>
                  </div>



                  <div className="space-y-3 pt-4 border-t border-border-subtle">
                    <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider ml-1 flex items-center gap-2">
                       <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px]">AI</span> Krisp Gürültü Engelleme
                    </label>
                    <div className="panel rounded-xl p-5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-foreground text-sm flex items-center gap-2">
                          Arka Plan Seslerini Filtrele
                          {krisp.isNoiseFilterEnabled && <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 uppercase tracking-wider font-black">Aktif</span>}
                        </div>
                        <div className="text-xs text-foreground-muted mt-1 leading-relaxed max-w-[280px]">
                          Yapay zeka ile klavye, fan veya çevresel sesleri yok ederek sadece insan sesini iletir.
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newState = !krisp.isNoiseFilterEnabled;
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('krispEnabled', String(newState));
                          }
                          krisp.setNoiseFilterEnabled(newState);
                        }}
                        disabled={krisp.isNoiseFilterPending}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none ${krisp.isNoiseFilterEnabled ? 'bg-emerald-500' : 'bg-background-tertiary'} ${krisp.isNoiseFilterPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center shadow-md ${krisp.isNoiseFilterEnabled ? 'bg-white left-7' : 'bg-foreground-muted left-1'}`}>
                          {krisp.isNoiseFilterEnabled ? (
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
                          ) : (
                            <svg className="w-4 h-4 text-background-tertiary" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-background-tertiary border border-border-subtle p-8 rounded-2xl flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-background-secondary flex items-center justify-center text-3xl">⚠️</div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-foreground text-lg tracking-tight">Cihaz Erişimi Yok</h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">Donanım cihazlarınızı yapılandırabilmek için önce bir kanala bağlanın.</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-border-subtle bg-background-secondary flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-accent-primary flex items-center justify-center text-white font-bold text-lg">{username.charAt(0)}</div>
                 <div>
                   <div className="font-bold text-foreground text-md">{username}</div>
                   <div className="text-[11px] text-foreground-muted uppercase tracking-wider">Kullanıcı Hesabı</div>
                 </div>
               </div>
               <button 
                 onClick={async () => { 
                   await supabase.auth.signOut(); 
                   setShowSettings(false); 
                   window.location.href = '/'; 
                 }} 
                 className="px-6 py-2.5 bg-danger hover:bg-red-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                 ÇIKIŞ YAP
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}