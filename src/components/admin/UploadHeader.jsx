import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { showSuccess, showError } from "../../utils/toast";

const UploadHeader = ({ title, fetchUrl, uploadUrl, deleteUrl }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(fetchUrl)
      .then((res) => setImage(res.data))
      .catch(() => setImage(null));
  }, [fetchUrl]);

  const handleFileChange = (e) => {
    if (e.target.files.length === 0) return;

    const file = e.target.files[0];
    
    // Dosya boyutu kontrolü (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      showError(`Dosya boyutu çok büyük! Maksimum dosya boyutu: 50MB. Seçilen dosya: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    axiosInstance
      .post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000, // 5 dakika timeout (büyük dosyalar için)
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Yükleme ilerlemesi: ${percentCompleted}%`);
          }
        },
      })
      .then((res) => {
        setImage(res.data);
        showSuccess(`${title} başarıyla yüklendi!`);
      })
      .catch((e) => {
        console.error("Yükleme hatası detayları:", {
          message: e.message,
          code: e.code,
          status: e.response?.status,
          statusText: e.response?.statusText,
          data: e.response?.data,
        });
        
        if (e.code === "ECONNABORTED" || e.message.includes("timeout")) {
          showError(`${title} yükleme zaman aşımına uğradı. Lütfen tekrar deneyin.`);
        } else if (e.code === "ERR_NETWORK" || e.response?.status === 0) {
          showError(`Ağ hatası oluştu. İnternet bağlantınızı kontrol edin ve tekrar deneyin. Sunucuya bağlanılamıyor olabilir.`);
        } else if (e.response?.status === 500) {
          const errorMsg = e.response?.data?.message || e.response?.data?.error || "Sunucu hatası";
          showError(`Sunucu hatası (500): ${errorMsg}. Dosya boyutu çok büyük olabilir veya sunucu geçici olarak kullanılamıyor. Lütfen daha küçük bir dosya deneyin veya daha sonra tekrar deneyin.`);
        } else if (e.response?.status === 413) {
          showError("Dosya boyutu çok büyük! Lütfen daha küçük bir dosya seçin.");
        } else if (e.response?.status >= 400 && e.response?.status < 500) {
          showError(`İstek hatası (${e.response?.status}): ${e.response?.data?.message || e.message}`);
        } else {
          showError(`${title} yüklenirken hata oluştu: ${e.response?.data?.message || e.response?.data?.error || e.message || "Bilinmeyen hata"}`);
        }
      })
      .finally(() => setLoading(false));
  };

  const clearImage = () => {
    axiosInstance
      .delete(deleteUrl)
      .then(() => {
        setImage(null);
        showSuccess(`${title} başarıyla kaldırıldı!`);
      })
      .catch(() => showError(`${title} kaldırılırken hata oluştu`));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 w-full overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 md:px-6 py-3 md:py-4">
        <h2 className="text-base md:text-xl font-bold text-white flex items-center gap-2 md:gap-3">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm md:text-base">
            {title === "Header Logo" ? "🏢" : "⭐"}
          </div>
          <span className="truncate">{title}</span>
        </h2>
        <p className="text-indigo-100 mt-1 text-xs md:text-sm line-clamp-1">
          {title === "Header Logo" ? "Site başlığında görünecek logo" : "Tarayıcı sekmesinde görünecek ikon"}
        </p>
      </div>

      <div className="p-4 md:p-6">
        <div className="relative w-full h-48 md:h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800 transition-all duration-200 hover:border-indigo-400 dark:hover:border-indigo-500">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
              <span className="text-sm text-gray-600 dark:text-gray-400">Yükleniyor...</span>
            </div>
          ) : image ? (
            <>
              <img
                src={image.imageUrl}
                alt={title}
                className="w-full h-full object-contain p-4"
              />
              <button
                onClick={clearImage}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                title="Kaldır"
              >
                <Trash2 size={16} />
              </button>
              <div className="absolute bottom-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                ✓ Yüklendi
              </div>
            </>
          ) : (
            <label
              htmlFor={`upload-${title}`}
              className="flex flex-col items-center gap-3 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
            >
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                <Upload size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-700 dark:text-gray-300">Resim Yükle</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {title === "Header Logo" ? "PNG, JPG formatında" : "ICO, PNG formatında"}
                </p>
              </div>
            </label>
          )}
          <input
            id={`upload-${title}`}
            type="file"
            accept={title === "Favicon" ? "image/x-icon,image/png" : "image/*"}
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>

        {image && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-green-700 dark:text-green-300">
                <span className="font-medium">{title} başarıyla yüklendi.</span>
                <br />
                <span className="text-xs text-green-600 dark:text-green-400">
                  Değiştirmek için önce silin.
                </span>
              </p>
            </div>
          </div>
        )}

        {!image && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  {title === "Header Logo" ? "Logo Önerileri" : "Favicon Önerileri"}
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {title === "Header Logo" 
                    ? "Yüksek kaliteli, şeffaf arka planlı logo kullanın. Boyut: 200x60px önerilir."
                    : "16x16px veya 32x32px boyutunda, net ve tanınabilir ikon kullanın."
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function LogoSettings() {
  return (
    <div className="w-full">
      {/* Ana Başlık */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="truncate">Logo & Favicon Yönetimi</span>
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Site logonuzu ve favicon'unuzu yönetin ve güncelleyin
        </p>
      </div>

      {/* Ana İçerik - Sol ve Sağ Panel */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
        {/* Sol Panel - Logo Kartları */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <UploadHeader
              title="Header Logo"
              fetchUrl="/logo"
              uploadUrl="/logo"
              deleteUrl="/logo"
            />
            <UploadHeader
              title="Favicon"
              fetchUrl="/favicon"
              uploadUrl="/favicon"
              deleteUrl="/favicon"
            />
          </div>
        </div>

        {/* Sağ Panel - Bilgi Paneli */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-600 p-4 md:p-6 lg:sticky lg:top-6">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Logo & Favicon Rehberi
            </h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Header Logo
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span>PNG veya JPG formatında olmalı</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span>Şeffaf arka plan önerilir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span>Boyut: 200x60px ideal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span>Yüksek kaliteli görsel kullanın</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Favicon
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>ICO veya PNG formatında olmalı</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>16x16px veya 32x32px boyutunda</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>Basit ve tanınabilir tasarım</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>Tarayıcı sekmesinde görünür</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
