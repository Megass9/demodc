"use client";

import React from 'react';
import {
  useParticipants,
  useTracks,
  VideoTrack,
  ConnectionQualityIndicator,
  ParticipantContext,
  useRoomContext,
  useIsSpeaking,
  useTrackVolume,
  useParticipantTracks,
  isTrackReference
} from '@livekit/components-react';
import { Track, Participant, RoomEvent } from 'livekit-client';

interface VoiceRoomProps {
  room: string;
}

function UserAvatar({ p }: { p: Participant }) {
  const isSpeaking = useIsSpeaking(p);
  const tracks = useParticipantTracks([Track.Source.Microphone], p.identity);
  const trackRef = tracks[0];
  const volume = useTrackVolume(trackRef && isTrackReference(trackRef) ? trackRef : undefined);
  
  // Real-time audio detection for zero latency
  const isActuallySpeaking = isSpeaking || volume > 0.12;

  const cameraPub = p.getTrackPublication(Track.Source.Camera);
  const isCameraEnabled = p.isCameraEnabled && cameraPub;

  return (
    <div className={`w-28 h-28 rounded-[2rem] overflow-hidden flex items-center justify-center text-4xl font-black bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-2xl transition-all duration-300 relative group/avatar
      ${isActuallySpeaking ? 'ring-4 ring-emerald-500 ring-offset-4 ring-offset-[#0f172a] scale-110' : 'ring-4 ring-white/5 opacity-90'}`}>
      
      {isCameraEnabled ? (
        <VideoTrack
          trackRef={{
            participant: p,
            source: Track.Source.Camera,
            publication: cameraPub
          }}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="drop-shadow-lg">{p.identity ? p.identity.charAt(0).toUpperCase() : '?'}</span>
      )}

      {/* Speaking Indicator Pulse (Optional additive effect) */}
      {isActuallySpeaking && (
        <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
}

function VoiceUsers() {
  const participants = useParticipants();
  
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 justify-items-center">
        {participants.map((p) => (
          <ParticipantContext.Provider value={p} key={p.sid}>
            <div className="flex flex-col items-center group/user">
              <UserAvatar p={p} />
              <div className="mt-4 glass rounded-2xl px-4 py-2 flex items-center gap-2 border-white/5 group-hover/user:border-white/10 transition-all">
                <span className="text-sm font-bold text-white tracking-tight">{p.identity}</span>
                {!p.isMicrophoneEnabled && (
                  <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-rose-500/20 text-rose-500">
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3"><path d="M12 2c1.66 0 3 1.34 3 3v7c0 1.66-1.34 3-3 3s-3-1.34-3-3V5c0-1.66 1.34-3 3-3zm7 10h-1.7c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.41 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72z" /><path d="M4.41 2.86L3 4.27l16.73 16.73 1.41-1.41L4.41 2.86z" /></svg>
                  </div>
                )}
                <ConnectionQualityIndicator className="w-4 h-4 opacity-50" />
              </div>
            </div>
          </ParticipantContext.Provider>
        ))}
      </div>
    </div>
  );
}

function ScreenShareItem({ trackRef }: { trackRef: any }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/40 flex-1 min-w-[360px] flex items-center justify-center shadow-2xl group/screen glass">
       <VideoTrack trackRef={trackRef} className="w-full h-full object-contain" />
       <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-2 border-white/5">
         <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
           <span className="text-xs font-black text-white/90 uppercase tracking-widest">{trackRef.participant.identity} EKRANI</span>
         </div>
       </div>
       <button 
         onClick={toggleFullScreen}
         className="absolute top-4 right-4 glass p-3 rounded-xl border-white/5 opacity-0 group-hover/screen:opacity-100 transition-all hover:bg-white/10 text-white"
       >
         <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
       </button>
    </div>
  );
}

function ScreenShares() {
  const tracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]);
  if (tracks.length === 0) return null;

  return (
    <div className="flex gap-6 p-6 overflow-x-auto custom-scrollbar-horizontal bg-white/5 border-b border-white/5 max-h-[60vh] shrink-0">
      {tracks.map((trackRef) => (
        <ScreenShareItem key={`${trackRef.participant.sid}-${trackRef.source}`} trackRef={trackRef} />
      ))}
    </div>
  );
}

function RoomAudioTracker() {
  const room = useRoomContext();
  
  React.useEffect(() => {
    const playSound = (url: string) => {
      const audio = new Audio(url);
      audio.volume = 0.3;
      audio.play().catch(() => {});
    };

    const joinUrl = 'https://www.myinstants.com/media/sounds/discord-join.mp3';
    const leaveUrl = 'https://www.myinstants.com/media/sounds/discord-leave.mp3';

    playSound(joinUrl);
    room.on(RoomEvent.ParticipantConnected, () => playSound(joinUrl));
    room.on(RoomEvent.ParticipantDisconnected, () => playSound(leaveUrl));

    return () => {
      playSound(leaveUrl);
      room.off(RoomEvent.ParticipantConnected, () => playSound(joinUrl));
      room.off(RoomEvent.ParticipantDisconnected, () => playSound(leaveUrl));
    };
  }, [room]);

  return null;
}

export default function VoiceRoom({ room }: VoiceRoomProps) {
  return (
    <div className="flex-1 flex flex-col w-full relative h-full">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/5 blur-[120px] pointer-events-none"></div>
      
      <div className="h-20 flex items-center justify-between px-8 bg-white/5 border-b border-white/5 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
          </div>
          <div>
            <h2 className="font-black text-white text-xl tracking-tight leading-none mb-1">{room}</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Sesli Kanal • Canlı</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <RoomAudioTracker />
        <ScreenShares />
        <VoiceUsers />
      </div>
    </div>
  );
}