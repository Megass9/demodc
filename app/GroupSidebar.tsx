"use client";

import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useLocalParticipant, MediaDeviceMenu, useParticipants } from '@livekit/components-react';

interface GroupSidebarProps {
  username: string;
  activeChannel: 'chat' | 'voice';
  onChannelSelect: (channel: 'chat' | 'voice') => void;
  isInVoice: boolean;
  onLeaveVoice: () => void;
}

function MicToggle() {
  const { localParticipant } = useLocalParticipant();
  const isMicrophoneEnabled = localParticipant?.isMicrophoneEnabled ?? false;
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Tıklamanın arkadaki katmanlara geçmesini engeller
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={!localParticipant}
      className={`p-1.5 rounded-md transition-colors ${!localParticipant ? 'opacity-50 cursor-wait text-gray-500' : isMicrophoneEnabled ? 'text-green-700 hover:bg-green-200' : 'text-red-600 bg-red-100 hover:bg-red-200'}`}
      title={isMicrophoneEnabled ? 'Mikrofonu Kapat' : 'Mikrofonu Aç'}
    >
      {isMicrophoneEnabled ? (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
      ) : (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
      )}
    </button>
  )
}

function ScreenShareToggle() {
  const { localParticipant } = useLocalParticipant();
  const isScreenShareEnabled = localParticipant?.isScreenShareEnabled ?? false;
  
  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localParticipant) {
      try {
        await localParticipant.setScreenShareEnabled(!isScreenShareEnabled, {
          resolution: { width: 1920, height: 1080, frameRate: 30 } // 1080p 30 FPS yakalama ayarı
        });
      } catch (err) {
        console.error('Ekran paylaşımı hatası:', err);
      }
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={!localParticipant}
      className={`p-1.5 rounded-md transition-colors ${!localParticipant ? 'opacity-50 cursor-wait text-gray-500' : isScreenShareEnabled ? 'text-blue-700 bg-blue-200 hover:bg-blue-300' : 'text-gray-600 hover:bg-gray-200'}`}
      title={isScreenShareEnabled ? 'Ekran Paylaşımını Durdur' : 'Ekran Paylaş'}
    >
      {isScreenShareEnabled ? (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h20v14H2z"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="3" y1="3" x2="21" y2="17"/></svg>
      ) : (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
      )}
    </button>
  )
}

export default function GroupSidebar({ username, activeChannel, onChannelSelect, isInVoice, onLeaveVoice }: GroupSidebarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const participants = useParticipants();

  return (
    <div className="w-64 bg-gray-50 flex flex-col border-r border-gray-200 shrink-0">
      <div className="h-16 border-b border-gray-200 flex items-center px-4 font-bold shadow-sm text-gray-800 text-lg bg-gray-100/50">
        Bizim upGr
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Metin Kanalları */}
        <div>
          <div className="text-gray-500 text-xs font-bold uppercase mb-2 flex items-center px-1">
            Metin Kanalları
          </div>
          <div 
            onClick={() => onChannelSelect('chat')}
            className={`px-2 py-2 rounded cursor-pointer flex items-center font-medium transition-colors ${activeChannel === 'chat' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
          >
            <span className={`${activeChannel === 'chat' ? 'text-blue-500' : 'text-gray-400'} mr-2 text-lg`}>#</span> sohbet
          </div>
        </div>

        {/* Ses Kanalları */}
        <div>
          <div className="text-gray-500 text-xs font-bold uppercase mb-2 flex items-center px-1">
            Ses Kanalları
          </div>
          <div 
            onClick={() => onChannelSelect('voice')}
            className={`px-2 py-2 rounded cursor-pointer flex items-center transition-colors group ${activeChannel === 'voice' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
          >
            <span className={`mr-2 ${activeChannel === 'voice' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}`}>🔊</span> Genel Ses
          </div>
          {/* Ses Kanalına Bağlı Dinamik Kullanıcı Listesi */}
          {participants.length > 0 && (
            <div className="pl-8 pr-2 pb-2 mt-1 space-y-1">
              {participants.map((p) => (
                <div key={p.sid} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-200 p-1 rounded transition-colors">
                  <div className={`w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${p.isSpeaking ? 'ring-2 ring-green-500 ring-offset-1 ring-offset-gray-50' : ''}`}>
                    {p.identity ? p.identity.charAt(0).toUpperCase() : '?'}
                  </div>
                  <span className={`text-sm truncate font-medium ${p.isSpeaking ? 'text-gray-900' : 'text-gray-600'}`}>
                    {p.identity}
                  </span>
                  {!p.isMicrophoneEnabled && <span className="text-red-500 text-xs ml-auto">🔇</span>}
                </div>
              ))}
            </div>
          )}
          
        </div>
      </div>
      
      {/* Sese Bağlı Durumu Bildirimi */}
      {isInVoice && (
        <div className="bg-green-50 border-t border-green-200 p-3 flex flex-col shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center text-green-700 text-sm font-bold">
              <span className="mr-2 h-2 w-2 bg-green-500 rounded-full animate-pulse"></span> Sese Bağlı
            </div>
            <button onClick={onLeaveVoice} className="text-green-700 hover:text-red-600 transition-colors p-1" title="Aramadan Ayrıl">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-green-600 cursor-pointer hover:underline font-medium" onClick={() => onChannelSelect('voice')}>Genel Ses</div>
            <div className="flex items-center space-x-1">
              <ScreenShareToggle />
              <MicToggle />
            </div>
          </div>
        </div>
      )}

      {/* Profil Paneli */}
      <div className="h-16 bg-white flex items-center px-4 space-x-2 shrink-0 border-t border-gray-200">
        <div className="w-9 h-9 bg-orange-500 rounded-full relative cursor-pointer flex-shrink-0">
           <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="text-sm font-semibold text-gray-800 truncate" title={username}>{username}</div>
          <div className="text-xs text-green-600 truncate">Çevrimiçi</div>
        </div>
        
        <div className="flex items-center -mr-2 space-x-1">
          {/* Ayarlar Çark İkonu */}
          <button onClick={() => setShowSettings(true)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-md transition-colors" title="Ayarlar">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
        </div>
      </div>

      {/* Ayarlar Modalı (Popup) */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col" data-lk-theme="default">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="text-lg font-bold text-gray-800">Kullanıcı Ayarları</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {isInVoice ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">🎤 Mikrofon Seçimi</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <MediaDeviceMenu kind="audioinput" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">🔊 Hoparlör Seçimi</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <MediaDeviceMenu kind="audiooutput" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm flex items-start">
                  <span className="mr-2 text-lg">⚠️</span>
                  <p>Donanım cihazlarınızı listeleyip seçebilmek için lütfen önce <b>Genel Ses</b> kanalına bağlanın.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center rounded-b-xl">
               <div className="text-sm text-gray-500 font-medium">{username}</div>
               <button onClick={() => { supabase.auth.signOut(); setShowSettings(false); }} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold transition-colors shadow-sm flex items-center">
                 <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                 Çıkış Yap
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}