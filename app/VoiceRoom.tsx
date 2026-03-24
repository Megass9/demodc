"use client";

import React from 'react';
import {
  useParticipants,
  useTracks,
  VideoTrack
} from '@livekit/components-react';
import { Track } from 'livekit-client';

interface VoiceRoomProps {
  room: string;
}

// Discord benzeri yuvarlak avatarlı kullanıcı listesi bileşeni
function VoiceUsers() {
  const participants = useParticipants();
  
  return (
    <div className="flex flex-wrap gap-6 p-8 items-start content-start flex-1 overflow-y-auto bg-gray-900">
      {participants.map((p) => (
        <div key={p.sid} className="flex flex-col items-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold bg-blue-600 text-white shadow-lg ${p.isSpeaking ? 'ring-4 ring-green-500 ring-offset-4 ring-offset-gray-900 scale-105' : 'ring-4 ring-transparent'}`}>
            {p.identity ? p.identity.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="mt-3 bg-gray-800 px-3 py-1 rounded-full text-sm font-medium text-white shadow-sm flex items-center gap-2">
            {p.identity}
            {!p.isMicrophoneEnabled && <span className="text-red-500 text-xs">🔇</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScreenShareItem({ trackRef }: { trackRef: any }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Tam ekran hatası: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div ref={containerRef} className="relative rounded-lg overflow-hidden border border-gray-700 bg-black flex-1 min-w-[300px] flex items-center justify-center shadow-2xl group">
       <VideoTrack trackRef={trackRef} className="w-full h-full object-contain" />
       <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1.5 rounded-md text-sm font-medium backdrop-blur-sm shadow-lg">
         {trackRef.participant.identity} - Ekran Paylaşımı
       </div>
       {/* Sağ Üstteki Tam Ekran Butonu */}
       <button 
         onClick={toggleFullScreen}
         className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 shadow-lg"
         title="Tam Ekran"
       >
         <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
       </button>
    </div>
  );
}

function ScreenShares() {
  // Ekran paylaşımı olan yayınları (track) otomatik dinler
  const tracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]);
  
  if (tracks.length === 0) return null;

  return (
    <div className="flex gap-4 p-4 overflow-x-auto bg-gray-950 border-b border-gray-800 max-h-[70vh] shrink-0">
      {tracks.map((trackRef) => (
        <ScreenShareItem key={`${trackRef.participant.sid}-${trackRef.source}`} trackRef={trackRef} />
      ))}
    </div>
  );
}

export default function VoiceRoom({ room }: VoiceRoomProps) {
  return (
    <div className="flex-1 flex flex-col w-full shadow-sm relative bg-gray-900">
      <div className="h-16 border-b border-gray-800 flex items-center px-6 shrink-0 bg-gray-950 z-10">
        <span className="text-xl mr-2 text-blue-500">🔊</span>
        <span className="font-bold text-white text-lg">{room}</span>
      </div>

      <ScreenShares />
      <VoiceUsers />
    </div>
  );
}