"use client";

import React, { useEffect, useState } from 'react';
import ChatArea from './ChatArea';
import GroupSidebar from './GroupSidebar';
import VoiceRoom from './VoiceRoom';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { ScreenSharePresets } from 'livekit-client';
import '@livekit/components-styles';

interface DiscordAppProps {
  session: any;
}

const FloatingHearts = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(15)].map((_, i) => (
        <div 
          key={i}
          className="heart-particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
            fontSize: `${14 + Math.random() * 20}px`,
            color: i % 2 === 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(236, 72, 153, 0.15)'
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
};

// Ekran paylaşımı için daha dengeli bir varsayılan (720p 30fps)
const DEFAULT_SCREEN_SHARE_CONFIG = ScreenSharePresets.h720fps30.encoding;

export default function DiscordApp({ session }: DiscordAppProps) {
  const [activeChannel, setActiveChannel] = useState<'chat' | 'voice'>('chat');
  const [isInVoice, setIsInVoice] = useState(false);
  const [voiceToken, setVoiceToken] = useState("");
  const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  const [qualityPreset, setQualityPreset] = useState(DEFAULT_SCREEN_SHARE_CONFIG);

  useEffect(() => {
    const loadQuality = () => {
      const saved = localStorage.getItem('screenShareQuality');
      if (saved) {
        switch(saved) {
          case 'auto': setQualityPreset(ScreenSharePresets.h720fps30.encoding); break;
          case '1080p60': setQualityPreset({ maxBitrate: 3_500_000, maxFramerate: 60 }); break;
          case '1080p30': setQualityPreset({ maxBitrate: 2_500_000, maxFramerate: 30 }); break;
          case '720p30': setQualityPreset(ScreenSharePresets.h720fps30.encoding); break;
          case '480p30': setQualityPreset({ maxBitrate: 750_000, maxFramerate: 30 }); break;
        }
      }
    };
    
    if (typeof window !== 'undefined') {
      loadQuality();
      window.addEventListener('screenShareQualityChanged', loadQuality);
      return () => window.removeEventListener('screenShareQualityChanged', loadQuality);
    }
  }, []);

  useEffect(() => {
    if (session) {
      const currentUsername = session.user.email.split('@')[0];
      fetch(`/livekit?room=Genel Ses&username=${currentUsername}`)
        .then(res => res.json())
        .then(data => setVoiceToken(data.token))
        .catch(err => console.error("Token hatası:", err));
    }
  }, [session]);

  const currentUsername = session.user.email.split('@')[0];

  const handleChannelSelect = (channel: 'chat' | 'voice') => {
    setActiveChannel(channel);
    if (channel === 'voice') setIsInVoice(true);
  };

  return (
    <LiveKitRoom
      video={false}
      audio={isInVoice}
      token={voiceToken}
      serverUrl={liveKitUrl}
      connect={isInVoice && !!voiceToken} // Sadece butona tıklandığında ve token varsa bağlanır
      options={{
        adaptiveStream: true, // Bant genişliğine göre kaliteyi otomatik ayarlar (donmaları önler)
        dynacast: true,       // İzlenmeyen yayınları duraklatarak tasarruf sağlar
        stopLocalTrackOnUnpublish: true, // Yayın durunca kaynakları serbest bırakır
        publishDefaults: {
          screenShareEncoding: qualityPreset,
          dtx: true, // Sessiz anlarda veri gönderimini durdurur (CPU/Bant genişliği dostu)
          audioPreset: { maxBitrate: 48_000 }, // Ses kalitesini sınırlayarak dalgalanmayı önler
        },
        videoCaptureDefaults: {
          facingMode: 'user',
        },
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      }}
    >
      {/* Ana Uygulama Çerçevesi - Clean Slate Konsepti */}
      <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans relative">
        <FloatingHearts />
        <div className="flex flex-row w-full h-full relative z-10 glass-panel border-none rounded-none">
          <GroupSidebar
            username={currentUsername}
            activeChannel={activeChannel}
            onChannelSelect={handleChannelSelect}
            isInVoice={isInVoice}
            onLeaveVoice={() => { setIsInVoice(false); setActiveChannel('chat'); }}
          />

          <main className="flex-1 flex flex-col relative overflow-hidden min-h-0">
            <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${activeChannel === 'chat' ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none z-0'}`}>
              <ChatArea username={currentUsername} channelName={activeChannel === 'chat' ? 'sohbet' : undefined} />
            </div>

            <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${activeChannel === 'voice' ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none z-0'}`}>
              {isInVoice && <VoiceRoom room="Genel Ses" />}
            </div>
          </main>
        </div>

        <RoomAudioRenderer />
      </div>
    </LiveKitRoom>
  );
}