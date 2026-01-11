import React, { useEffect, useState } from "react";
import SwitchOnOff from "../../utils/SwitchOnOff";
import axiosInstance from "../../api/axiosInstance";

const SocialMediaSettings = () => {
  const [settings, setSettings] = useState([]);

  useEffect(() => {
    axiosInstance.get("/social-media").then((res) => setSettings(res.data));
  }, []);

  const handleToggle = (platform) => {
    const item = settings.find((s) => s.platform === platform);
    axiosInstance
      .put(`/social-media/${platform}`, null, {
        params: { visible: !item.visible, url: item.url || "" },
      })
      .then((res) => {
        setSettings((prev) =>
          prev.map((s) =>
            s.platform === platform ? { ...s, visible: res.data.visible } : s
          )
        );
      });
  };

  const normalizeUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  const handleUrlChange = (platform, newUrl) => {
    const item = settings.find((s) => s.platform === platform);
    const normalized = normalizeUrl(newUrl);
    axiosInstance
      .put(`/social-media/${platform}`, null, {
        params: { visible: item.visible, url: normalized },
      })
      .then((res) => {
        setSettings((prev) =>
          prev.map((s) =>
            s.platform === platform ? { ...s, url: res.data.url } : s
          )
        );
      });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 w-full mx-auto overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-lg flex items-center justify-center text-base md:text-lg">
            📱
          </div>
          <span className="truncate">Sosyal Medya Ayarları</span>
        </h2>
        <p className="text-red-100 mt-1 md:mt-2 text-xs md:text-sm">Sosyal medya hesaplarınızı yönetin ve görünürlüklerini ayarlayın</p>
      </div>

      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg md:rounded-xl">
          <div className="flex items-start gap-2 md:gap-3">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1 text-xs md:text-sm">Bilgi</h4>
              <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300 break-words">
                URL adresini "https://(URL adresiniz)" şeklinde girin. Örnek: https://instagram.com/kullaniciadi
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          {settings.map((s) => (
            <div
              key={s.platform}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-md transition-all duration-200"
            >
              {/* Üst Satır - Platform Icon, Name ve Toggle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 md:mb-4">
                <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl md:text-2xl">
                      {s.platform === 'instagram' && '📷'}
                      {s.platform === 'facebook' && '📘'}
                      {s.platform === 'twitter' && '🐦'}
                      {s.platform === 'linkedin' && '💼'}
                      {s.platform === 'youtube' && '📺'}
                      {s.platform === 'tiktok' && '🎵'}
                      {s.platform === 'whatsapp' && '💬'}
                      {s.platform === 'telegram' && '✈️'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-white capitalize text-base md:text-lg truncate">
                      {s.platform}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                      {s.platform} hesabınızın URL'sini girin
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-end">
                  <span className={`text-xs md:text-sm font-medium ${
                    s.visible ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {s.visible ? 'Görünür' : 'Gizli'}
                  </span>
                  <SwitchOnOff
                    checked={s.visible}
                    onChange={() => handleToggle(s.platform)}
                  />
                </div>
              </div>

              {/* Alt Satır - URL Input */}
              <div className="mb-3 md:mb-4">
                <input
                  type="text"
                  className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  value={s.url}
                  placeholder={`https://${s.platform}.com/kullaniciadi`}
                  onChange={(e) => handleUrlChange(s.platform, e.target.value)}
                />
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  s.visible ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 break-words">
                  {s.visible ? 'Bu platform footer\'da görüntüleniyor' : 'Bu platform footer\'da gizli'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-600">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Özet
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="text-gray-600 dark:text-gray-300 truncate">
                Aktif: {settings.filter(s => s.visible).length} platform
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-gray-400 rounded-full flex-shrink-0"></div>
              <span className="text-gray-600 dark:text-gray-300 truncate">
                Gizli: {settings.filter(s => !s.visible).length} platform
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaSettings;
