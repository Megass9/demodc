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
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#0f172a]">
        {/* Animated Background Highlights */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="w-full max-w-[440px] z-10 animate-fade-in">
          <div className="glass-card rounded-3xl p-8 md:p-10">
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-6 rotate-3">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
                  <path d="M19.27 4.51a1.1 1.1 0 0 0-1-.18l-1.42.36c-1.35.33-2.73.5-4.13.5s-2.78-.17-4.13-.5l-1.42-.36a1.1 1.1 0 0 0-1 .18 1.1 1.1 0 0 0-.44.89v10.5a1.1 1.1 0 0 0 .76 1l13.62 4.4a1.1 1.1 0 0 0 1.42-1V5.4a1.1 1.1 0 0 0-.44-.89zM15 12a1 1 0 1 1 1-1 1 1 0 0 1-1 1zM9 12a1 1 0 1 1 1-1 1 1 0 0 1-1 1z" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                {isLogin ? 'Tekrar Hoş Geldin!' : 'Aramıza Katıl'}
              </h2>
              <p className="text-gray-400 mt-2 text-center text-sm">
                {isLogin ? 'Seni tekrar görmek harika. Hemen giriş yap.' : 'Yeni bir deneyime hazır mısın? Kayıt ol ve başla.'}
              </p>
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
                <span className="mt-0.5">⚠️</span>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">E-posta</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="ornek@mail.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">Şifre</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
                {isLogin && (
                  <div className="flex justify-end mt-1">
                    <button type="button" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Şifremi Unuttum</button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl transition-all font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.98] mt-4"
              >
                {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-gray-500">{isLogin ? 'Hesabın yok mu? ' : 'Zaten hesabın var mı? '}</span>
              <button
                onClick={() => { setIsLogin(!isLogin); setAuthError(''); }}
                className="text-blue-400 hover:text-blue-300 transition-colors font-bold underline-offset-4 hover:underline"
              >
                {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-gray-500 text-xs tracking-wider uppercase">
            &copy; 2026 Demodc App • Tasarım: Emre dargaç
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
      <div className="flex h-screen w-full bg-[#0f172a] text-slate-200 overflow-hidden font-sans relative">
        {/* Subtle Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex flex-row w-full h-full relative z-10">
          <GroupSidebar
            username={currentUsername}
            activeChannel={activeChannel}
            onChannelSelect={handleChannelSelect}
            isInVoice={isInVoice}
            onLeaveVoice={() => { setIsInVoice(false); setActiveChannel('chat'); }}
          />

          <main className="flex-1 flex flex-col relative overflow-hidden">
            {/* Odalar arası geçişte bileşeni yok etmiyoruz, sadece görünmez yapıyoruz */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${activeChannel === 'chat' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute inset-0'}`}>
              <ChatArea username={currentUsername} />
            </div>

            <div className={`flex-1 flex flex-col transition-all duration-300 ${activeChannel === 'voice' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute inset-0'}`}>
              {isInVoice && <VoiceRoom room="Genel Ses" />}
            </div>
          </main>
        </div>

        {/* Odadaki konuşmaları duymak için */}
        <RoomAudioRenderer />
      </div>
    </LiveKitRoom>
  );
}
