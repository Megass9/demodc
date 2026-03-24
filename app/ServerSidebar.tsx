import React from 'react';

export default function ServerSidebar() {
  return (
    <div className="w-[72px] bg-gray-200 flex flex-col items-center py-3 space-y-4 overflow-y-auto no-scrollbar border-r border-gray-300">
      {/* Ana Sayfa / DM İkonu */}
      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center hover:rounded-xl transition-all cursor-pointer shadow-md">
        <span className="font-bold text-white">DM</span>
      </div>
      
      {/* Ayırıcı Çizgi */}
      <div className="w-8 h-[2px] bg-gray-300 rounded-full" />
      
      {/* Örnek Sunucular */}
      {[1, 2, 3, 4, 5].map((server) => (
        <div 
          key={server} 
          className="w-12 h-12 bg-white text-gray-600 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white hover:rounded-xl transition-all cursor-pointer shadow-sm"
        >
          S{server}
        </div>
      ))}
    </div>
  );
}