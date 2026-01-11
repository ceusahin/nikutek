import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { showSuccess, showError, showConfirm } from "../../utils/toast";

const SeoSettings = () => {
  const [seo, setSeo] = useState({
    title: "",
    description: "",
    keywords: [],
  });

  const [keywordInput, setKeywordInput] = useState("");
  const [isKeywordsExpanded, setIsKeywordsExpanded] = useState(false);

  // SEO bilgilerini backend'den al
  useEffect(() => {
    axiosInstance.get("/seo").then((res) => {
      const data = res.data;
      setSeo({
        title: data.title || "",
        description: data.description || "",
        keywords: data.keywords
          ? data.keywords.split(",").map((k) => k.trim())
          : [],
      });
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSeo((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeywordInput = (e) => setKeywordInput(e.target.value);

  const addKeyword = () => {
    const newKeyword = keywordInput.trim();
    if (newKeyword && !seo.keywords.includes(newKeyword)) {
      setSeo((prev) => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword],
      }));
    }
    setKeywordInput("");
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  const removeKeyword = (index) => {
    setSeo((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }));
  };

  const clearAllKeywords = async () => {
    const confirmed = await showConfirm(
      `${seo.keywords.length} anahtar kelimeyi silmek istediğinize emin misiniz?`
    );
    if (confirmed) {
      setSeo((prev) => ({
        ...prev,
        keywords: [],
      }));
      showSuccess('Tüm anahtar kelimeler silindi!');
    }
  };

  const handleSave = () => {
    const payload = { ...seo, keywords: seo.keywords.join(",") };
    axiosInstance.put("/seo", payload).then(() => {
      showSuccess("SEO bilgileri başarıyla güncellendi!");
    }).catch(() => {
      showError("SEO bilgileri güncellenirken bir hata oluştu!");
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 w-full mx-auto overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-lg flex items-center justify-center text-base md:text-lg">
            🔍
          </div>
          <span className="truncate">SEO Ayarları</span>
        </h2>
        <p className="text-red-100 mt-1 md:mt-2 text-xs md:text-sm">Arama motorları için sitenizi optimize edin</p>
      </div>

      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Title Section */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-1 16h12l-1-16M9 9h6M9 13h6" />
              </svg>
            </div>
            <label className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">
              Sayfa Başlığı
            </label>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg md:rounded-xl p-3 md:p-4">
            <div className="flex items-start gap-2 mb-2">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs md:text-sm font-medium text-yellow-800 dark:text-yellow-200 break-words">
                İpucu: Şirket ismi geçmeli, 50-60 karakter arası ideal
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                name="title"
                value={seo.title}
                onChange={handleChange}
                placeholder="Örnek: Nikutek - Endüstriyel Pompa Çözümleri"
                className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              />
              <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 text-xs text-gray-400">
                {seo.title.length}/255
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-500 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <label className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">
              Meta Açıklama
            </label>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg md:rounded-xl p-3 md:p-4">
            <div className="flex items-start gap-2 mb-2">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs md:text-sm font-medium text-blue-800 dark:text-blue-200 break-words">
                İpucu: 120-150 karakter arası ideal, sitenizi özetleyen açıklama yazın
              </span>
            </div>
            <div className="relative">
              <textarea
                name="description"
                value={seo.description}
                onChange={handleChange}
                placeholder="Sitenizin ne hakkında olduğunu açıklayan kısa bir metin yazın..."
                className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none whitespace-pre-line"
                rows={4}
              />
              <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 text-xs text-gray-400">
                {seo.description.length}/255
              </div>
            </div>
          </div>
        </div>

        {/* Keywords Section */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <label className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">
              Anahtar Kelimeler
            </label>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg md:rounded-xl p-3 md:p-4">
            <div className="flex items-start gap-2 mb-3 md:mb-4">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs md:text-sm font-medium text-green-800 dark:text-green-200 break-words">
                Virgülle ayırın veya Enter / Ekle ile ekleyin
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-3 md:mb-4">
              <input
                type="text"
                value={keywordInput}
                onChange={handleKeywordInput}
                onKeyDown={handleKeywordKeyDown}
                placeholder="Örnek: pompa, endüstriyel, su pompası"
                className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ekle
              </button>
            </div>

            {/* Keywords Display */}
            {seo.keywords.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
                {/* Collapsible Header */}
                <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={() => setIsKeywordsExpanded(!isKeywordsExpanded)}
                    className="flex-1 flex items-center gap-2 md:gap-3 text-left group"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <h4 className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Eklenen Anahtar Kelimeler
                      </h4>
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {seo.keywords.length}
                      </span>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                      {isKeywordsExpanded ? (
                        <ChevronUp className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={clearAllKeywords}
                    className="ml-2 p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors group flex items-center gap-1.5 text-xs md:text-sm font-medium"
                    title="Tüm anahtar kelimeleri sil"
                  >
                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Tümünü Sil</span>
                  </button>
                </div>

                {/* Collapsible Content */}
                {isKeywordsExpanded && (
                  <div className="p-3 md:p-4 max-h-64 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {seo.keywords.map((k, idx) => (
                        <span
                          key={idx}
                          className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 text-red-700 dark:text-red-300 px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center gap-1.5 md:gap-2 border border-red-200 dark:border-red-800 animate-fadeIn"
                        >
                          <span className="text-xs md:text-sm font-medium break-all">{k}</span>
                          <button
                            type="button"
                            onClick={() => removeKeyword(idx)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 transition-colors duration-200 p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800/30 flex-shrink-0"
                          >
                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collapsed Preview */}
                {!isKeywordsExpanded && (
                  <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex flex-wrap gap-2">
                      {seo.keywords.slice(0, 5).map((k, idx) => (
                        <span
                          key={idx}
                          className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 text-red-700 dark:text-red-300 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium border border-red-200 dark:border-red-800"
                        >
                          {k.length > 20 ? k.substring(0, 20) + '...' : k}
                        </span>
                      ))}
                      {seo.keywords.length > 5 && (
                        <button
                          type="button"
                          onClick={() => setIsKeywordsExpanded(true)}
                          className="px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          +{seo.keywords.length - 5} daha
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 md:pt-6">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            SEO Ayarlarını Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeoSettings;
