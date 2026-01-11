import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";
import { showSuccess, showError } from "../../utils/toast";
import { Save, ChevronDown, ChevronUp, Globe, Image as ImageIcon } from "lucide-react";

const PAGE_TYPES = [
  { value: "home", label: "Ana Sayfa", icon: "🏠" },
  { value: "about", label: "Hakkımızda", icon: "ℹ️" },
  { value: "technologies", label: "Teknolojiler", icon: "🔧" },
  { value: "products", label: "Ürünler", icon: "📦" },
  { value: "category_products", label: "Kategori Ürünleri", icon: "📁" },
  { value: "blog", label: "Blog", icon: "📝" },
  { value: "references", label: "Referanslar", icon: "⭐" },
  { value: "contact", label: "İletişim", icon: "📞" },
];

const LANGUAGES = [
  { code: "tr", name: "Türkçe" },
  { code: "en", name: "English" },
];

const PageSeoSettings = () => {
  const { language: currentLanguage } = useLanguage();
  const [selectedPageType, setSelectedPageType] = useState("home");
  const [selectedLang, setSelectedLang] = useState("tr");
  const [seoSettings, setSeoSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    keywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
  });

  // Tüm SEO ayarlarını yükle
  useEffect(() => {
    fetchAllSeoSettings();
  }, []);

  // Seçili sayfa tipi ve dil değiştiğinde formu güncelle
  useEffect(() => {
    const key = `${selectedPageType}_${selectedLang}`;
    const existing = seoSettings[key];
    if (existing) {
      setFormData({
        title: existing.title || "",
        description: existing.description || "",
        keywords: existing.keywords || "",
        ogTitle: existing.ogTitle || "",
        ogDescription: existing.ogDescription || "",
        ogImage: existing.ogImage || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        keywords: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
      });
    }
  }, [selectedPageType, selectedLang, seoSettings]);

  const fetchAllSeoSettings = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/page-seo");
      const settingsMap = {};
      res.data.forEach((setting) => {
        const key = `${setting.pageType}_${setting.language}`;
        settingsMap[key] = setting;
      });
      setSeoSettings(settingsMap);
    } catch (error) {
      console.error("SEO ayarları yüklenemedi:", error);
      showError("SEO ayarları yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.post("/page-seo", {
        pageType: selectedPageType,
        language: selectedLang,
        title: formData.title,
        description: formData.description,
        keywords: formData.keywords,
        ogTitle: formData.ogTitle,
        ogDescription: formData.ogDescription,
        ogImage: formData.ogImage,
      });

      showSuccess("SEO ayarları başarıyla kaydedildi!");
      await fetchAllSeoSettings();
    } catch (error) {
      console.error("SEO ayarları kaydedilemedi:", error);
      showError(error.response?.data?.message || "SEO ayarları kaydedilirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const selectedPage = PAGE_TYPES.find((p) => p.value === selectedPageType);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 w-full mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-lg flex items-center justify-center text-base md:text-lg">
            🔍
          </div>
          <span className="truncate">Sayfa SEO Ayarları</span>
        </h2>
        <p className="text-purple-100 mt-1 md:mt-2 text-xs md:text-sm">
          Her sayfa için ayrı SEO ayarları yapın
        </p>
      </div>

      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-500 dark:text-gray-400">Yükleniyor...</span>
          </div>
        ) : (
          <>
            {/* Sayfa Tipi ve Dil Seçimi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sayfa Tipi */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sayfa Tipi
                </label>
                <select
                  value={selectedPageType}
                  onChange={(e) => setSelectedPageType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {PAGE_TYPES.map((page) => (
                    <option key={page.value} value={page.value}>
                      {page.icon} {page.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dil */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dil
                </label>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Temel SEO */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("basic")}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Temel SEO Ayarları
                    </span>
                  </div>
                  {expandedSections.basic ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {expandedSections.basic && (
                  <div className="p-4 space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Başlık (Title)
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Sayfa başlığı..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-1">{formData.title.length}/500</p>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Açıklama (Description)
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Sayfa açıklaması..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Keywords */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Anahtar Kelimeler (Keywords)
                      </label>
                      <input
                        type="text"
                        name="keywords"
                        value={formData.keywords}
                        onChange={handleChange}
                        placeholder="virgülle ayırın: örnek1, örnek2, örnek3"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Open Graph */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("og")}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Open Graph (Sosyal Medya)
                    </span>
                  </div>
                  {expandedSections.og ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {expandedSections.og && (
                  <div className="p-4 space-y-4">
                    {/* OG Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        OG Başlık
                      </label>
                      <input
                        type="text"
                        name="ogTitle"
                        value={formData.ogTitle}
                        onChange={handleChange}
                        placeholder="Sosyal medyada görünecek başlık..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                        maxLength={500}
                      />
                    </div>

                    {/* OG Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        OG Açıklama
                      </label>
                      <textarea
                        name="ogDescription"
                        value={formData.ogDescription}
                        onChange={handleChange}
                        placeholder="Sosyal medyada görünecek açıklama..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* OG Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        OG Görsel URL
                      </label>
                      <input
                        type="text"
                        name="ogImage"
                        value={formData.ogImage}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PageSeoSettings;

