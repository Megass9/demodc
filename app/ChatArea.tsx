"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface ChatAreaProps {
  username: string;
  channelName?: string;
}

export default function ChatArea({ username, channelName = 'sohbet' }: ChatAreaProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // 1. Sayfa yüklendiğinde veritabanındaki eski mesajları çek
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Mesajları çekerken hata:", error.message);
        return;
      }
      if (data) setMessages(data);
    };
    fetchMessages();

    // 2. Yeni gelen mesajları anlık (realtime) olarak dinle
    const subscription = supabase
      .channel('messages_channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        console.log("Yeni mesaj alındı:", payload.new);
        setMessages((current) => [payload.new, ...current]);
      })
      .subscribe((status) => {
        console.log("Supabase kanal durumu:", status);
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert([{ content: newMessage, username }]);
    
    if (error) {
      console.error("Mesaj gönderirken hata:", error.message);
      alert("Mesaj gönderilemedi: " + error.message);
    } else {
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-transparent overflow-hidden relative">
      {/* Sohbet Üst Bilgi Çubuğu */}
      <div className="h-16 bg-background-secondary border-b border-border-subtle flex items-center justify-between px-6 shrink-0 relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-background-tertiary text-foreground-muted rounded-md flex items-center justify-center font-bold text-lg">
            #
          </div>
          <div>
            <div className="font-bold text-foreground text-[16px] tracking-tight">{channelName}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
              <span className="text-[11px] text-foreground-muted font-medium lowercase">#{channelName} odası • 12 aktif</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          <div className="flex -space-x-3 ml-2 group">
            <div className="w-9 h-9 rounded-xl border-2 border-[#1e293b] bg-blue-500 hover:z-10 transition-transform hover:-translate-y-1" title="Kullanıcı 1"></div>
            <div className="w-9 h-9 rounded-xl border-2 border-[#1e293b] bg-green-500 hover:z-10 transition-transform hover:-translate-y-1" title="Kullanıcı 2"></div>
            <div className="w-9 h-9 rounded-xl border-2 border-[#1e293b] bg-orange-500 hover:z-10 transition-transform hover:-translate-y-1" title="Kullanıcı 3"></div>
            <div className="w-9 h-9 rounded-xl border-2 border-[#1e293b] bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white hover:z-10 transition-transform hover:-translate-y-1">
              +9
            </div>
          </div>
        </div>
      </div>
      
      {/* Mesajların Listelendiği Alan */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4 space-y-reverse flex flex-col-reverse custom-scrollbar">
        {messages.map((msg, index) => {
          const isMe = msg.username === username;
          return (
            <div key={msg.id || index} className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-start gap-3 group`}>
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-[15px] text-white
                ${isMe ? 'bg-accent-primary' : 'bg-background-tertiary'}`}>
                {msg.username ? msg.username.charAt(0).toUpperCase() : '?'}
              </div>
              <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[13px] font-bold text-foreground hover:underline cursor-pointer">{msg.username}</span>
                  <span className="text-[11px] text-foreground-muted font-medium">
                    {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`px-4 py-2.5 rounded-lg text-[14px] leading-relaxed
                  ${isMe 
                    ? 'bg-accent-primary text-white' 
                    : 'bg-background-secondary text-foreground border border-border-subtle'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mesaj Yazma Inputu (En Alt) */}
      <div className="px-6 pb-6 pt-4 shrink-0 bg-transparent">
        <form onSubmit={handleSendMessage} className="bg-background-secondary/90 backdrop-blur-sm rounded-xl px-2 py-2 flex items-center gap-2 shadow-lg border border-border-subtle">
          <button type="button" className="w-10 h-10 bg-background-tertiary hover:bg-background-tertiary/80 rounded-lg flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors shrink-0">
            <span className="text-2xl font-light leading-none mb-1">+</span>
          </button>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`${channelName} kanalına mesaj gönder...`} 
            className="bg-transparent text-foreground w-full outline-none placeholder:text-foreground-muted text-[15px] px-2"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-10 h-10 bg-accent-primary hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-md flex items-center justify-center text-white transition-colors shrink-0"
          >
            <svg className="w-5 h-5 rotate-90 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}