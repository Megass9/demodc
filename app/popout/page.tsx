"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LiveKitRoom, VideoTrack, RoomAudioRenderer, useTracks, isTrackReference } from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';

function PopoutContent() {
  const searchParams = useSearchParams();
  const room = searchParams.get('room');
  const token = searchParams.get('token');
  const targetIdentity = searchParams.get('identity');
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!room || !token || !serverUrl) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0f172a] text-white font-bold">
        Geçersiz Parametreler
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={true}
      video={false}
      options={{ adaptiveStream: true, dynacast: true }}
    >
      <div className="h-screen w-full bg-black flex items-center justify-center overflow-hidden relative">
        <StreamRenderer targetIdentity={targetIdentity} />
        <RoomAudioRenderer />
        
        {/* Overlay Info */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 z-20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {targetIdentity} Yayını • Canlı
            </span>
          </div>
        </div>
      </div>
    </LiveKitRoom>
  );
}

function StreamRenderer({ targetIdentity }: { targetIdentity: string | null }) {
  const tracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]);
  
  // Hedef kişinin ekran paylaşımını bul, bulamazsa ilk bulduğunu göster
  const trackRef = tracks.find(t => t.participant.identity === targetIdentity) || tracks[0];

  if (!trackRef || !isTrackReference(trackRef)) {
    return (
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <div className="w-12 h-12 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
        <span className="font-bold text-sm tracking-widest uppercase">Yayın Bekleniyor...</span>
      </div>
    );
  }

  return <VideoTrack trackRef={trackRef} className="w-full h-full object-contain" />;
}

export default function PopoutPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[#0f172a]" />}>
      <PopoutContent />
    </Suspense>
  );
}
