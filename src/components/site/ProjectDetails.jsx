import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";
import ContactForm from "./ContactForm";
import renderHTML from "../../utils/renderHTML";

// PDF URL'lerini düzelt - Backend endpoint'ine yönlendir
const fixPdfUrl = (url) => {
  if (!url) return url;
  
  // Eğer zaten tam URL ise (http/https ile başlıyorsa), olduğu gibi dön
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Eğer backend endpoint'i ise (/api/nikutek/ ile başlıyorsa)
  if (url.startsWith('/api/nikutek/')) {
    const baseURL = axiosInstance.defaults.baseURL || '';
    // baseURL zaten /api/nikutek içeriyor, URL'den /api/nikutek kısmını çıkar
    const pathWithoutPrefix = url.replace('/api/nikutek', '');
    return baseURL + pathWithoutPrefix;
  }
  
  // Eski Cloudinary URL'leri için - artık kullanılmayacak ama fallback olarak bırakıyoruz
  // Yeni yüklenen PDF'ler backend'den gelecek
  return url;
};

const ProjectDetails = () => {
  const { slug } = useParams();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("ozellikler");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFrequency, setSelectedFrequency] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/products/slug/${slug}?lang=${language}`);
        const data = res.data;

        if (!data || data.active === false) {
          setProduct(null);
          return;
        }

        setProduct(data);
        // Ürün değiştiğinde seçili hz'i sıfırla
        setSelectedFrequency(null);
      } catch (err) {
        console.error("Ürün alınamadı:", err);
        setProduct(null);
        setSelectedFrequency(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug, language]);

  // Hook'ları her zaman çağır (product null olsa bile)
  const allFeatures = product?.features || [];
  const catalogs = product?.catalogs || [];
  
  // Mevcut dildeki özellikleri filtrele
  const currentLanguageFeatures = useMemo(() => {
    if (!product) return [];
    return allFeatures.filter((f) => f.langCode === language);
  }, [allFeatures, language, product]);
  
  // Ürünün sahip olduğu hz değerlerini bul
  const availableFrequencies = useMemo(() => {
    if (!product || currentLanguageFeatures.length === 0) return [];
    return [
      ...new Set(
        currentLanguageFeatures
          .map((f) => f.frequency)
          .filter((f) => f !== null && f !== undefined)
      ),
    ].sort((a, b) => a - b);
  }, [currentLanguageFeatures, product]);
  
  // Ürün yüklendiğinde varsayılan hz değerini ayarla
  useEffect(() => {
    if (product && availableFrequencies.length > 0) {
      // Eğer seçili hz mevcut değerler arasında değilse veya null ise, ilk değeri seç
      if (selectedFrequency === null || !availableFrequencies.includes(selectedFrequency)) {
        setSelectedFrequency(availableFrequencies[0]);
      }
    } else if (product && availableFrequencies.length === 0) {
      // Hz değeri yoksa null yap
      setSelectedFrequency(null);
    }
  }, [product?.id, availableFrequencies, selectedFrequency]);
  
  // Seçili hz'e göre özellikleri filtrele
  const features = useMemo(() => {
    if (!product || currentLanguageFeatures.length === 0) return [];
    if (selectedFrequency !== null) {
      return currentLanguageFeatures.filter((f) => f.frequency === selectedFrequency);
    }
    return currentLanguageFeatures.filter((f) => f.frequency === null || f.frequency === undefined);
  }, [currentLanguageFeatures, selectedFrequency, product]);

  if (loading)
    return (
      <div className="text-center mt-20 text-xl animate-pulse">
        {language === "tr" ? "Yükleniyor..." : "Loading..."}
      </div>
    );

  if (!product)
    return <div className="text-center mt-20 text-xl">{language === "tr" ? "Ürün bulunamadı." : "Product not found."}</div>;

  const translation =
    product.translations?.find((t) => t.langCode === language) ||
    product.translations?.[0] ||
    {};

  return (
    <div className="pt-24 sm:pt-28 md:pt-32 lg:pt-40 xl:pt-44 2xl:pt-48 pb-8 md:pb-12">
      {/* ÜST BÖLÜM */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16 lg:py-20">
        {/* İÇERİK KONTEYNER */}
        <div className="flex flex-col">
          {/* BAŞLIK - Sol ve Sağ Kutunun Üstünde */}
          <div className="mb-8 md:mb-12 w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold border-2 border-[#fdf001] rounded-full px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 w-full text-center shadow-xl">
              {translation.title || (language === "tr" ? "Ürün" : "Product")}
            </h1>
          </div>

          {/* SOL VE SAĞ İÇERİK - Başlığın Altında */}
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12">
          {/* SOL GÖRSEL */}
          <div className="lg:w-2/5 w-full flex items-center justify-center">
            <img
              src={product.imageUrl || "/images/default.webp"}
              alt={translation.title}
              className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] object-cover rounded-xl md:rounded-2xl shadow-lg"
            />
          </div>

          {/* SAĞ AÇIKLAMA */}
          <div className="lg:w-3/5 w-full flex flex-col justify-center">
            <div className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              {translation.description ? (
                renderHTML(translation.description)
              ) : (
                <p className="italic text-gray-500 dark:text-gray-400">
                  {language === "tr" ? "Bu ürün için açıklama henüz eklenmemiştir." : "Description for this product has not been added yet."}
                </p>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* TAB MENÜSÜ */}
      <div className="py-6 md:py-10">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          {/* Butonlar */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-10">
            {[
              { key: "ozellikler", label: language === "tr" ? "Özellikler" : "Features" },
              { key: "kataloglar", label: language === "tr" ? "Kataloglar" : "Catalogs" },
              { key: "iletisim", label: language === "tr" ? "İletişim" : "Contact" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-colors duration-300
                  ${
                    activeTab === tab.key
                      ? "bg-[#fdf001] text-black shadow-xl"
                      : "bg-transparent border border-[#fdf001] text-black font-thin hover:bg-[#fdf001] hover:cursor-pointer"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab İçerikleri */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 bg-white dark:bg-gray-900 shadow-lg">
            {/* 🟡 Özellikler */}
            {activeTab === "ozellikler" && (
              <div className="w-full">
                {/* Hz Seçici - Eğer ürünün farklı hz değerleri varsa göster */}
                {availableFrequencies.length > 0 && (
                  <div className="mb-6 flex justify-center">
                    <div className="w-full sm:w-auto">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center sm:text-left">
                        {language === "tr" ? "Frekans Seçiniz:" : "Select Frequency:"}
                      </label>
                      <select
                        value={selectedFrequency ?? ""}
                        onChange={(e) => setSelectedFrequency(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full sm:w-48 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-[#fdf001] rounded-lg focus:ring-2 focus:ring-[#fdf001] focus:border-[#fdf001] transition-colors font-medium shadow-md"
                      >
                        {availableFrequencies.map((freq) => (
                          <option key={freq} value={freq}>
                            {freq} Hz
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                
                {features.length > 0 ? (
                  <div className="space-y-4">
                    {/* Desktop: Grid Layout */}
                    <div className="hidden md:grid md:grid-cols-2 gap-4">
                      {features.map((feature, i) => (
                        <div
                          key={i}
                          className="group relative bg-gradient-to-br from-black to-gray-900 rounded-xl p-5 
                                     border border-[#fdf001]/20 hover:border-[#fdf001] 
                                     shadow-md hover:shadow-[0_8px_30px_rgba(253,240,1,0.15)]
                                     transition-all duration-300 hover:scale-[1.02]"
                        >
                          {/* Özellik Adı */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-2 bg-[#fdf001] rounded-full"></div>
                            <h3 className="text-[#fdf001] font-bold text-base md:text-lg uppercase tracking-wide">
                              {feature.name || (language === "tr" ? "Özellik" : "Feature")}
                            </h3>
                          </div>
                          
                          {/* Özellik Değeri */}
                          <div className="text-white text-sm md:text-base leading-relaxed pl-5">
                            {feature.value || "-"}
                          </div>
                          
                          {/* Hover Effect Border */}
                          <div className="absolute inset-0 rounded-xl border-2 border-[#fdf001] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Mobile: Vertical List */}
                    <div className="md:hidden space-y-3">
                      {features.map((feature, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-r from-black to-gray-900 rounded-lg p-4 
                                     border-l-4 border-[#fdf001] shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-[#fdf001] rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <h3 className="text-[#fdf001] font-bold text-sm uppercase mb-1">
                                {feature.name || (language === "tr" ? "Özellik" : "Feature")}
                              </h3>
                              <p className="text-white text-sm leading-relaxed">
                                {feature.value || "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 md:py-16">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg">
                      {language === "tr" ? "Özellik bulunmamaktadır." : "No features available."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 🟡 Kataloglar */}
            {activeTab === "kataloglar" &&
              (catalogs.length > 0 ? (
                <ul className="flex flex-col sm:flex-row justify-center items-center flex-wrap gap-3 sm:gap-4">
                  {catalogs.map((catalog, index) => (
                    <li
                      key={index}
                      className="w-full sm:w-auto"
                    >
                      <a
                        href={fixPdfUrl(catalog.fileUrl || catalog.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 sm:p-4 rounded-full text-[#fdf001] bg-black hover:bg-gray-900 transition-colors duration-300 text-center text-sm sm:text-base hover:underline"
                        type="application/pdf"
                        onClick={(e) => {
                          const url = fixPdfUrl(catalog.fileUrl || catalog.url);
                          // Eğer backend endpoint'i ise, yeni sekmede aç
                          if (url.includes('/api/nikutek/')) {
                            e.preventDefault();
                            window.open(url, '_blank');
                          }
                          // Cloudinary URL'i ise direkt açılacak
                        }}
                      >
                        {catalog.name || (language === "tr" ? "Katalog" : "Catalog")}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg">
                    {language === "tr" ? "Katalog bulunmamaktadır." : "No catalogs available."}
                  </p>
                </div>
              ))}

            {/* 🟡 İletişim */}
            {activeTab === "iletisim" && (
              <div>
                <ContactForm />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
