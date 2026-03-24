import React from 'react';

export default function ChannelSidebar() {
  return (
    <div className="w-60 bg-gray-50 flex flex-col border-r border-gray-200">
      {/* Sunucu Başlığı */}
      <div className="h-12 border-b border-gray-200 flex items-center px-4 font-bold shadow-sm cursor-pointer hover:bg-gray-100 transition-colors text-gray-800">
        Yazılım Topluluğu
      </div>
      
      {/* Kanallar Listesi */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <div className="text-gray-500 text-xs font-bold uppercase mb-1 flex items-center hover:text-gray-700 cursor-pointer">
            <span className="mr-1">v</span> Metin Kanalları
          </div>
          {['genel', 'yardım', 'projeler', 'off-topic'].map((channel) => (
            <div 
              key={channel} 
              className="px-2 py-1.5 mt-0.5 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded cursor-pointer flex items-center group"
            >
              <span className="text-gray-400 mr-2 text-xl group-hover:text-gray-600">#</span> {channel}
            </div>
          ))}
        </div>
      </div>

      {/* Kullanıcı Profili Paneli (Alt Kısım) */}
      <div className="h-14 bg-gray-100 flex items-center px-2 space-x-2 shrink-0 border-t border-gray-200">
        <div className="w-8 h-8 bg-blue-600 rounded-full relative cursor-pointer">
           <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-gray-100 rounded-full"></div>
        </div>
        <div className="flex-1 cursor-pointer py-1">
          <div className="text-sm font-semibold text-white leading-tight">Yazılımcı</div>
          <div className="text-[11px] text-gray-500 leading-tight hover:text-gray-700">Çevrimiçi</div>
        </div>
      </div>
    </div>
  );
}