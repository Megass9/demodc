"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface ChatAreaProps {
  username: string;
}

export default function ChatArea({ username }: ChatAreaProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // 1. Sayfa yüklendiğinde veritabanındaki eski mesajları çek
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setMessages(data);
    };
    fetchMessages();

    // 2. Yeni gelen mesajları anlık (realtime) olarak dinle
    const subscription = supabase
      .channel('messages_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((current) => [payload.new, ...current]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await supabase.from('messages').insert([{ content: newMessage, username }]);
    setNewMessage('');
  };

  return (
    <div className="flex-1 bg-white flex flex-col w-full shadow-sm">
      {/* Sohbet Üst Bilgi Çubuğu */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 shadow-sm shrink-0 bg-gray-50">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mr-3">
            #
          </div>
          <div>
            <div className="font-bold text-gray-800 text-lg">sohbet</div>
            <div className="text-xs text-gray-500">Grubun genel sohbet odası</div>
          </div>
        </div>
        <div className="flex -space-x-2">
          {/* Basit kullanıcı avatarları */}
          <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-500" title="Kullanıcı 1"></div>
          <div className="w-8 h-8 rounded-full border-2 border-white bg-green-500" title="Kullanıcı 2"></div>
          <div className="w-8 h-8 rounded-full border-2 border-white bg-orange-500" title="Kullanıcı 3"></div>
        </div>
      </div>
      
      {/* Mesajların Listelendiği Alan */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 space-y-reverse flex flex-col-reverse">
        {messages.map((msg) => (
          <div key={msg.id} className="flex space-x-4 hover:bg-gray-50 p-1 -mx-4 px-4 rounded transition-colors">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex-shrink-0 cursor-pointer flex items-center justify-center text-white font-bold">
              {msg.username ? msg.username.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="font-semibold text-blue-600 cursor-pointer hover:underline">{msg.username}</span>
                <span className="text-xs text-gray-400">
                  {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-gray-800 mt-1">
                {msg.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mesaj Yazma Inputu (En Alt) */}
      <div className="p-6 shrink-0 bg-white border-t border-gray-100">
        <form onSubmit={handleSendMessage} className="bg-gray-50 rounded-full p-2 pl-4 flex items-center border border-gray-300 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          {/* Artı ikonu placeholder'ı */}
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 cursor-pointer hover:bg-blue-200 text-blue-700 font-bold transition-colors">
            +
          </div>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesajınızı yazın..." 
            className="bg-transparent text-gray-900 w-full outline-none placeholder-gray-500"
          />
        </form>
      </div>
    </div>
  );
}