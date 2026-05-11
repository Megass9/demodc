"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import dynamic from 'next/dynamic';

const DynamicDiscordApp = dynamic(() => import('./DiscordApp'), { ssr: false });

export default function DiscordClone() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-background">
        <div className="w-full max-w-[400px] z-10 animate-fade-in animate-slide-up">
          <div className="bg-background-secondary rounded-2xl p-8 border border-border-subtle shadow-xl">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-accent-primary rounded-[14px] flex items-center justify-center shadow-md mb-5">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
                  <path d="M19.27 4.51a1.1 1.1 0 0 0-1-.18l-1.42.36c-1.35.33-2.73.5-4.13.5s-2.78-.17-4.13-.5l-1.42-.36a1.1 1.1 0 0 0-1 .18 1.1 1.1 0 0 0-.44.89v10.5a1.1 1.1 0 0 0 .76 1l13.62 4.4a1.1 1.1 0 0 0 1.42-1V5.4a1.1 1.1 0 0 0-.44-.89zM15 12a1 1 0 1 1 1-1 1 1 0 0 1-1 1zM9 12a1 1 0 1 1 1-1 1 1 0 0 1-1 1z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight text-center">
                {isLogin ? 'Tekrar Hoş Geldin!' : 'Aramıza Katıl'}
              </h2>
              <p className="text-foreground-muted mt-2 text-center text-sm font-medium">
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
                    className="w-full bg-background border border-border-subtle rounded-lg px-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-accent-primary transition-colors text-sm"
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
                  className="w-full bg-background border border-border-subtle rounded-lg px-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-accent-primary transition-colors text-sm"
                />
                {isLogin && (
                  <div className="flex justify-end mt-1.5">
                    <button type="button" className="text-xs text-foreground-muted hover:text-accent-primary transition-colors font-medium">Şifremi Unuttum</button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-accent-primary hover:bg-accent-hover text-white py-2.5 rounded-lg transition-colors font-semibold mt-2 text-sm"
              >
                {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-gray-500">{isLogin ? 'Hesabın yok mu? ' : 'Zaten hesabın var mı? '}</span>
              <button
                onClick={() => { setIsLogin(!isLogin); setAuthError(''); }}
                className="text-accent-primary hover:text-accent-hover transition-colors font-semibold hover:underline"
              >
                {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-gray-500 text-xs tracking-wider uppercase">
            &copy; 2026 Aslının Uygulaması • Tasarım: Emre dargaç
          </p>
        </div>
      </div>
    );
  }

  return <DynamicDiscordApp session={session} />;
}
