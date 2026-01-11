import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";

import RichTextEditor from "./RichTextEditor";

const CompanyInfoSettings = () => {
  const { language } = useLanguage(); // "tr" veya "en" olarak geliyor
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Şirket bilgilerini dil koduna göre getir
  useEffect(() => {
    if (!language) return;

    setLoading(true);
    axiosInstance
      .get(`/company-info/${language}`)
      .then((res) => {
        const data = res.data || {};
        // console.log("Company Info Response:", data);
        setCompanyName(data.companyName || "");
        setCompanyDescription(data.companyDescription || "");
        setMessage("");
      })
      .catch((err) => {
        console.error("Şirket bilgileri alınamadı:", err);
        setMessage("Şirket bilgileri alınamadı.");
        setCompanyName("");
        setCompanyDescription("");
      })
      .finally(() => setLoading(false));
  }, [language]);

  // 🔹 Şirket bilgilerini kaydet veya güncelle
  const handleSave = () => {
    if (!language) {
      setMessage("Dil seçili değil.");
      return;
    }

    setLoading(true);

    axiosInstance
      .post("/company-info", {
        companyName,
        companyDescription,
        languageCode: language, // backend DTO ile eşleşiyor
      })
      .then(() => {
        setMessage("✅ Şirket bilgileri kaydedildi.");
      })
      .catch(() => {
        setMessage("❌ Kaydetme başarısız.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 w-full overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-lg flex items-center justify-center text-base md:text-lg">
            🏢
          </div>
          <span className="truncate">Şirket Bilgileri Ayarları</span>
        </h2>
        <p className="text-red-100 mt-1 md:mt-2 text-xs md:text-sm">Şirket bilgilerinizi düzenleyin ve güncelleyin</p>
      </div>

      <div className="p-4 md:p-6 lg:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 dark:text-gray-400">Yükleniyor...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {/* Şirket İsmi */}
            <div className="space-y-2 md:space-y-3">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">
                Şirket İsmi
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Şirket adınızı girin"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Şirket Açıklaması */}
            <div className="space-y-2 md:space-y-3">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">
                Şirket Açıklaması
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Max. 200 karakter)</span>
              </label>
              <div className="relative">
                <RichTextEditor
                  value={companyDescription}
                  onChange={(value) => setCompanyDescription(value)}
                  placeholder="Şirketiniz hakkında kısa bir açıklama yazın"
                />
                <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 text-xs text-gray-400 z-10">
                  {companyDescription.replace(/<[^>]*>/g, '').length}/255
                </div>
              </div>
            </div>

            {/* Kaydet Butonu */}
            <div className="flex justify-end pt-2 md:pt-4">
              <button
                onClick={handleSave}
                className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-lg flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Kaydet
                  </>
                )}
              </button>
            </div>

            {/* Mesaj */}
            {message && (
              <div className={`p-3 md:p-4 rounded-lg md:rounded-xl text-sm md:text-base ${
                message.includes('✅') 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              }`}>
                <div className="flex items-center gap-2">
                  {message.includes('✅') ? (
                    <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="font-medium break-words">{message}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyInfoSettings;
