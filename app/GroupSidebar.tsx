"use client";

import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useLocalParticipant, MediaDeviceMenu, useParticipants, useIsSpeaking, useTrackVolume, useParticipantTracks, isTrackReference } from '@livekit/components-react';
import { Participant, Track } from 'livekit-client';
import ScreenPickerModal from './ScreenPickerModal';

interface GroupSidebarProps {
  username: string;
  activeChannel: 'chat' | 'voice';
  onChannelSelect: (channel: 'chat' | 'voice') => void;
  isInVoice: boolean;
  onLeaveVoice: () => void;
}

function ParticipantItem({ participant }: { participant: Participant }) {
  const isSpeaking = useIsSpeaking(participant);
  
  // Mikrofon track'ini buluyoruz
  const tracks = useParticipantTracks([Track.Source.Microphone], participant.identity);
  const trackRef = tracks[0];
  
  // Real-time ses seviyesini alıyoruz (VAD'den daha hızlı tepki verir)
  // useTrackVolume için trackRef'in geçerli bir TrackReference olduğundan emin oluyoruz
  const volume = useTrackVolume(trackRef && isTrackReference(trackRef) ? trackRef : undefined);
  
  // Yalnızca LiveKit'in VAD (İnsan Sesi Algılama) sistemi onaylarsa "konuşuyor" say (Gürültüleri engeller)
  const isActuallySpeaking = isSpeaking && volume > 0.05;
  
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

    const isElectron = typeof window !== 'undefined' && !!(window as any).electron;
    console.log('HandleToggle: isElectron:', isElectron, 'isEnabled:', isScreenShareEnabled);
    
    if (isElectron && !isScreenShareEnabled) {
      setShowPicker(true);
      return;
    }

    try {
      console.log('Toggling screen share...');
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled, { 
        audio: {
          echoCancellation: false, // Yankı engelleyiciyi kapat
          noiseSuppression: false, // Gürültü engelleyiciyi kapat
          autoGainControl: false   // Otomatik ses seviyesi dengelemeyi kapat
        }
      });
    } catch (err) {
      console.error('Ekran paylaşımı hatası:', err);
    }
  };

  const handleSourceSelect = async (sourceId: string) => {
    console.log('Source selected:', sourceId);
    setShowPicker(false);
    if (!localParticipant) return;

    try {
      console.log('Setting source in Electron...');
      await window.electron.setSource(sourceId);
      
      console.log('Enabling screen share in LiveKit...');
      await localParticipant.setScreenShareEnabled(true, { 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
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
  const participants = useParticipants();

  return (
    <div className="w-72 glass border-r border-white/5 flex flex-col shrink-0 overflow-hidden">
      <div className="h-20 flex items-center px-6 font-black tracking-tighter text-2xl text-white bg-white/5 uppercase">
        Seni <span className="text-blue-500 mx-1">Çok Seviyorum</span> Aslı
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
            className={`group px-3 py-2.5 rounded-xl cursor-pointer flex items-center font-bold transition-all duration-200 relative overflow-hidden ${
              activeChannel === 'chat' 
                ? 'bg-blue-600/10 text-blue-400' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            {activeChannel === 'chat' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full"></div>}
            <span className={`text-xl mr-3 ${activeChannel === 'chat' ? 'text-blue-500' : 'text-slate-600 transition-colors group-hover:text-slate-400'}`}>#</span> 
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
            className={`group px-3 py-2.5 rounded-xl cursor-pointer flex items-center font-bold transition-all duration-200 relative overflow-hidden ${
              activeChannel === 'voice' 
                ? 'bg-blue-600/10 text-blue-400' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            {activeChannel === 'voice' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full"></div>}
            <span className={`mr-3 text-lg ${activeChannel === 'voice' ? 'text-blue-500' : 'text-slate-600 transition-colors group-hover:text-slate-400'}`}>🔊</span> 
            Genel Ses
          </div>
          
          {/* Ses Kanalına Bağlı Dinamik Kullanıcı Listesi */}
          {participants.length > 0 && (
            <div className="pl-6 pr-2 mt-4 space-y-2">
              {participants.map((p) => (
                <ParticipantItem key={p.sid} participant={p} />
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
      <div className="p-4 bg-white/5 border-t border-white/5 flex items-center gap-3 shrink-0">
        <div className="w-11 h-11 bg-gradient-to-tr from-orange-400 to-rose-500 rounded-xl relative cursor-pointer flex-shrink-0 group ring-2 ring-transparent hover:ring-orange-500/50 transition-all p-0.5">
           <div className="w-full h-full rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-lg border-2 border-white/10 shadow-inner uppercase">
             {username.charAt(0)}
           </div>
           <div className="absolute bottom-[-2px] right-[-2px] w-4 h-4 bg-emerald-500 border-[3px] border-[#0f172a] rounded-full shadow-sm"></div>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="text-sm font-black text-white truncate tracking-tight" title={username}>{username}</div>
          <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
          </div>
        </div>
        
        <button 
          onClick={() => setShowSettings(true)} 
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all active:scale-90" 
          title="Ayarlar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </button>
      </div>

      {/* Ayarlar Modalı (Popup) */}
      {showSettings && (
        <div className="fixed inset-0 bg-[#0f172a]/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={() => setShowSettings(false)}>
          <div className="glass-card rounded-[32px] w-full max-w-lg flex flex-col shadow-2xl relative overflow-hidden" data-lk-theme="default" onClick={e => e.stopPropagation()}>
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Cihaz Ayarları</h2>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Donanım ve ses yapılandırması</p>
              </div>
              <button 
                onClick={() => setShowSettings(false)} 
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 transition-all rounded-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {isInVoice ? (
                <>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                       <span className="text-blue-500">01</span> Mikrofon Girişi
                    </label>
                    <div className="glass rounded-2xl p-4 border-white/5 hover:border-blue-500/30 transition-colors">
                      <MediaDeviceMenu kind="audioinput" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                       <span className="text-indigo-500">02</span> Hoparlör Çıkışı
                    </label>
                    <div className="glass rounded-2xl p-4 border-white/5 hover:border-indigo-500/30 transition-colors">
                      <MediaDeviceMenu kind="audiooutput" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                       <span className="text-violet-500">03</span> Video Kaynağı
                    </label>
                    <div className="glass rounded-2xl p-4 border-white/5 hover:border-violet-500/30 transition-colors">
                      <MediaDeviceMenu kind="videoinput" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-6 rounded-3xl flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-2xl shrink-0">⚠️</div>
                  <div>
                    <h3 className="font-black text-orange-200 text-lg mb-1">Cihaz Erişimi Yok</h3>
                    <p className="text-sm text-orange-400/80 leading-relaxed font-medium">Donanım cihazlarınızı yapılandırabilmek için öncelikle <b>Genel Ses</b> kanalına bir kez bağlanmanız gerekmektedir.</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 border-t border-white/5 bg-white/5 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black">{username.charAt(0)}</div>
                 <div className="font-bold text-white tracking-tight">{username}</div>
               </div>
               <button 
                 onClick={async () => { 
                   await supabase.auth.signOut(); 
                   setShowSettings(false); 
                   // Safyayı tamamen sıfırlayıp giriş ekranına yönlendiriyoruz
                   window.location.href = '/'; 
                 }} 
                 className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black transition-all active:scale-95 shadow-lg shadow-rose-600/20 flex items-center gap-2"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                 ÇIKIŞ
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}