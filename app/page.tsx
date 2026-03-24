"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import ChatArea from './ChatArea';
import GroupSidebar from './GroupSidebar';
import VoiceRoom from './VoiceRoom';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { ScreenSharePresets } from 'livekit-client';
import '@livekit/components-styles';

export default function DiscordClone() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState<'chat' | 'voice'>('chat');
  
  // Ses bağlantısı durumları
  const [isInVoice, setIsInVoice] = useState(false);
  const [voiceToken, setVoiceToken] = useState("");
  const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  // Form state'leri
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Oturum durumunu kontrol et
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Oturum değişikliklerini (giriş/çıkış) dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Kullanıcı giriş yaptıktan sonra LiveKit token'ını alıp arka planda hazır bekletiyoruz
  useEffect(() => {
    if (session) {
      const currentUsername = session.user.email.split('@')[0];
      fetch(`/livekit?room=Genel Ses&username=${currentUsername}`)
        .then(res => res.json())
        .then(data => setVoiceToken(data.token))
        .catch(err => console.error("Token hatası:", err));
    }
  }, [session]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
      
    if (error) setAuthError(error.message);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-100">Yükleniyor...</div>;

  // KULLANICI GİRİŞ YAPMAMIŞSA LOGIN EKRANINI GÖSTER
  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-200 font-sans">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            {isLogin ? 'Uygulamaya Giriş' : 'Yeni Kayıt'}
          </h2>
          {authError && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{authError}</div>}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">E-posta</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Şifre</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-medium">
              {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            {isLogin ? 'Hesabın yok mu? ' : 'Zaten hesabın var mı? '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline font-medium">
              {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // E-posta adresinin @ işaretinden önceki kısmını kullanıcı adı yapıyoruz (örn: ahmet@mail.com -> ahmet)
  const currentUsername = session.user.email.split('@')[0];

  const handleChannelSelect = (channel: 'chat' | 'voice') => {
    setActiveChannel(channel);
    if (channel === 'voice') setIsInVoice(true); // Sese tıklandığında hemen bağlan
  };

  return (
    <LiveKitRoom
      video={false}
      audio={isInVoice}
      token={voiceToken}
      serverUrl={liveKitUrl}
      connect={isInVoice && !!voiceToken} // Sadece butona tıklandığında ve token varsa bağlanır
      options={{
        publishDefaults: {
          // Yayının kodlama ve veri hızını 1080p 30FPS profiline zorluyoruz
          screenShareEncoding: ScreenSharePresets.h1080fps30.encoding,
        },
        audioCaptureDefaults: {
          echoCancellation: true, // Yankı yapmasını / sesin sekmesini önler
          noiseSuppression: true, // Arka plan gürültülerini engeller
          autoGainControl: true,  // Mikrofon ses seviyesini otomatik dengeler
        }
      }}
    >
      {/* LiveKitRoom varsayılan olarak dikey dizer, yatay (yan yana) tasarım için kendi wrapper div'imizi ekliyoruz */}
      <div className="flex flex-row h-screen w-full bg-gray-100 text-gray-900 overflow-hidden font-sans">
        <GroupSidebar 
          username={currentUsername} 
          activeChannel={activeChannel} 
          onChannelSelect={handleChannelSelect}
          isInVoice={isInVoice}
          onLeaveVoice={() => { setIsInVoice(false); setActiveChannel('chat'); }}
        />
        
        {/* Odalar arası geçişte bileşeni yok etmiyoruz, sadece görünmez yapıyoruz */}
        <div className={`flex-1 flex flex-col ${activeChannel === 'chat' ? '' : 'hidden'}`}><ChatArea username={currentUsername} /></div>
        <div className={`flex-1 flex flex-col ${activeChannel === 'voice' ? '' : 'hidden'}`}>{isInVoice && <VoiceRoom room="Genel Ses" />}</div>
        
        {/* Odadaki konuşmaları duymak için */}
        <RoomAudioRenderer />
      </div>
    </LiveKitRoom>
  );
}
