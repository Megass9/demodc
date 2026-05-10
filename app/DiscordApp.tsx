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

export default function DiscordApp({ session }: DiscordAppProps) {
  const [activeChannel, setActiveChannel] = useState<'chat' | 'voice'>('chat');
  const [isInVoice, setIsInVoice] = useState(false);
  const [voiceToken, setVoiceToken] = useState("");
  const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

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
        publishDefaults: {
          screenShareEncoding: ScreenSharePresets.h1080fps30.encoding,
          screenShareSimulcast: true, // Farklı bağlantı hızları için farklı kalitelerde yayın gönderir
          dtx: true,
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

        <div className="flex flex-row w-full h-full relative z-10">
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