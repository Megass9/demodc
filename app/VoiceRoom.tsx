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
  isTrackReference,
  useLocalParticipant,
  AudioTrack
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
  
  // Yalnızca insan sesi algılandığında ve minimal bir ses eşiği aşıldığında parlamayı yak
  const isActuallySpeaking = isSpeaking && volume > 0.05;

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

function ParticipantCard({ p }: { p: Participant }) {
  const { localParticipant } = useLocalParticipant();
  const isLocal = p.sid === localParticipant?.sid;
  const [volume, setVolume] = React.useState(1);

  const micTracks = useParticipantTracks([Track.Source.Microphone], p.identity);
  const micTrackRef = micTracks[0];

  // Kaydırıcı değiştiğinde diğer kullanıcının ses düzeyini günceller
  React.useEffect(() => {
    if (isLocal || !micTrackRef?.publication?.track) return;
    (micTrackRef.publication.track as any).setVolume(volume);
  }, [volume, micTrackRef, isLocal]);

  return (
    <ParticipantContext.Provider value={p}>
      <div className="flex flex-col items-center group/user relative">
        <UserAvatar p={p} />
        <div className="mt-4 glass rounded-2xl px-4 py-2 flex items-center gap-2 border-white/5 group-hover/user:border-white/10 transition-all z-10">
          <span className="text-sm font-bold text-white tracking-tight">{p.identity}</span>
          {!p.isMicrophoneEnabled && (
            <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-rose-500/20 text-rose-500">
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3"><path d="M12 2c1.66 0 3 1.34 3 3v7c0 1.66-1.34 3-3 3s-3-1.34-3-3V5c0-1.66 1.34-3 3-3zm7 10h-1.7c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.41 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72z" /><path d="M4.41 2.86L3 4.27l16.73 16.73 1.41-1.41L4.41 2.86z" /></svg>
            </div>
          )}
          <ConnectionQualityIndicator className="w-4 h-4 opacity-50" />
        </div>

        {/* Ses Kontrolü (Sadece diğer kullanıcılar için avatar üzerinde hover olunca belirir) */}
        {!isLocal && (
          <div className="absolute inset-x-0 bottom-14 flex justify-center opacity-0 group-hover/user:opacity-100 transition-all duration-300 z-20 translate-y-2 group-hover/user:translate-y-0 pointer-events-none">
            <div className="glass px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2 shadow-xl pointer-events-auto">
              <svg className="w-3.5 h-3.5 text-white/80 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
              />
            </div>
          </div>
        )}
      </div>
    </ParticipantContext.Provider>
  );
}

function VoiceUsers() {
  const participants = useParticipants();
  
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 justify-items-center">
        {participants.map((p) => (
          <ParticipantCard p={p} key={p.sid} />
        ))}
      </div>
    </div>
  );
}

function ScreenShareItem({ trackRef, isLocal }: { trackRef: any, isLocal: boolean }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const audioTracks = useParticipantTracks([Track.Source.ScreenShareAudio], trackRef.participant.identity);
  const audioTrackRef = audioTracks[0];
  const [volume, setVolume] = React.useState(1);

  // Kaydırıcı değiştiğinde diğer kullanıcının ekran paylaşımı ses düzeyini günceller
  React.useEffect(() => {
    if (isLocal || !audioTrackRef?.publication?.track) return;
    (audioTrackRef.publication.track as any).setVolume(volume);
  }, [volume, audioTrackRef, isLocal]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/40 h-[300px] aspect-video flex items-center justify-center shadow-2xl group/screen glass shrink-0">
       <VideoTrack trackRef={trackRef} className="w-full h-full object-contain" />
       
       {/* Ses Kontrolü (Sadece diğer kullanıcıların yayınlarında ve seste yayın varsa görünür) */}
       {!isLocal && audioTrackRef && (
         <div className="absolute top-4 left-4 glass px-3 py-2 rounded-xl border-white/5 opacity-0 group-hover/screen:opacity-100 transition-all z-20 flex items-center gap-3">
           <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
           <input
             type="range"
             min="0"
             max="1"
             step="0.01"
             value={volume}
             onChange={(e) => setVolume(parseFloat(e.target.value))}
             className="w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
           />
         </div>
       )}

       {isLocal && (
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover/screen:opacity-100 transition-opacity">
           <div className="glass px-4 py-2 rounded-xl border-white/10">
             <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Sonsuz döngüyü önlemek için pencereyi küçültebilir veya başka ekran seçebilirsiniz</p>
           </div>
         </div>
       )}
       
       <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-2 border-white/5 z-20">
         <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
           <span className="text-xs font-black text-white/90 uppercase tracking-widest">
             {isLocal ? 'EKRANINIZ' : `${trackRef.participant.identity} EKRANI`}
           </span>
         </div>
       </div>
       <button 
         onClick={toggleFullScreen}
         className="absolute top-4 right-4 glass p-3 rounded-xl border-white/5 opacity-0 group-hover/screen:opacity-100 transition-all hover:bg-white/10 text-white z-20"
       >
         <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
       </button>
    </div>
  );
}

function ScreenShares() {
  const tracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]);
  const { localParticipant } = useLocalParticipant();
  
  console.log('Room Status:', localParticipant?.sid ? 'Connected' : 'Connecting/Error');
  console.log('Detected ScreenShare Tracks:', tracks.length);
  
  if (tracks.length === 0) return null;

  return (
    <div className="flex gap-6 p-6 overflow-x-auto custom-scrollbar-horizontal bg-white/5 border-b border-white/5 max-h-[60vh] shrink-0">
      {tracks.map((trackRef) => {
        const isLocalUser = trackRef.participant.sid === localParticipant?.sid;
        console.log('Rendering Track for:', trackRef.participant.identity, 'isLocalUser:', isLocalUser, 'SID:', trackRef.participant.sid);
        return <ScreenShareItem key={`${trackRef.participant.sid}-${trackRef.source}`} trackRef={trackRef} isLocal={isLocalUser} />;
      })}
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