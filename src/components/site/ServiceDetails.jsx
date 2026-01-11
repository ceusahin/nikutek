import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";
import ContactForm from "./ContactForm";
import renderHTML from "../../utils/renderHTML";
import { getLocalizedPath } from "../../utils/routeUtils";

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

const TechnologyDetails = () => {
  const { slug } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [technology, setTechnology] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const fetchTechnology = async () => {
      try {
        setLoading(true);
        
        // Slug ve dil ile teknoloji çek
        const res = await axiosInstance.get(`/technologies/slug/${slug}?lang=${language}`);
        
        if (res.data && res.data.active !== false) {
          setTechnology(res.data);
          
          // Dil değiştiğinde URL'i güncelle
          const currentTranslation = res.data.translations?.find((t) => t.langCode === language) || res.data.translations?.[0];
          if (currentTranslation?.slug) {
            const newPath = getLocalizedPath("serviceDetail", currentTranslation.slug, language);
            const currentPath = window.location.pathname;
            // Eğer mevcut path yeni path'ten farklıysa, URL'i güncelle
            if (currentPath !== newPath) {
              navigate(newPath, { replace: true });
            }
          }
        } else {
          setTechnology(null);
        }
      } catch (err) {
        console.error("Teknoloji detayı alınamadı:", err);
        setTechnology(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTechnology();
    }
  }, [slug, language, navigate]);

  if (loading) {
    return (
      <div className="text-center mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fdf001] mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">{language === "tr" ? "Teknoloji detayları yükleniyor..." : "Loading technology details..."}</p>
      </div>
    );
  }

  if (!technology) {
    return (
      <div className="text-center mt-20 text-red-600 text-lg">
        {language === "tr" ? "Teknoloji bulunamadı." : "Technology not found."}
      </div>
    );
  }

  if (!technology.active) {
    return (
      <div className="text-center mt-20 text-gray-500 text-xl">
        {language === "tr" ? "Bu teknoloji şu anda aktif değil." : "This technology is currently not active."}
      </div>
    );
  }

  // Veri yapısını kontrol et
  console.log("Technology veri yapısı:", {
    id: technology.id,
    active: technology.active,
    imageUrl: technology.imageUrl,
    textContent: technology.textContent,
    translations: technology.translations,
    catalogs: technology.catalogs
  });

  // Backend'den gelen çevirilerde dil eşleştirme
  const translation =
    technology.translations?.find((t) => t.langCode === language) ||
    technology.translations?.[0] ||
    { title: language === "tr" ? "Teknoloji" : "Technology", description: language === "tr" ? "Açıklama bulunamadı" : "Description not found" };
  
  console.log("Seçilen çeviri:", translation);

  // Sekme başlıkları (dil destekli)
  const tabLabels = {
    description: language === "tr" ? "Açıklama" : "Description",
    catalogs: language === "tr" ? "Kataloglar" : "Catalogs",
    contact: language === "tr" ? "İletişim" : "Contact",
  };

  // textContent varsa metin, yoksa resim göster
  const hasTextContent = technology.textContent && technology.textContent.trim() !== "";
  const hasImage = technology.imageUrl && technology.imageUrl.trim() !== "";


  return (
    <div className="pt-32 md:pt-36 lg:pt-40 xl:pt-44 2xl:pt-48">
      <div className="container mx-auto px-6 py-20">
        {/* İÇERİK KONTEYNER */}
        <div className="flex flex-col">
          {/* BAŞLIK - Sol ve Sağ Kutunun Üstünde */}
          <div className="mb-8 md:mb-12 w-full">
            <h1 className="text-4xl md:text-5xl font-extrabold border-2 border-[#fdf001] rounded-full p-4 w-full text-center shadow-xl">
              {translation?.title || "—"}
            </h1>
          </div>

          {/* SOL VE SAĞ İÇERİK - Başlığın Altında */}
          <div className="flex flex-col lg:flex-row gap-12">
          {/* SOL İÇERİK (Resim veya Metin) */}
          {hasTextContent ? (
            // Text Content göster - Resim kutusu tasarımı yok, sadece text
            <div className="lg:w-2/5 w-full">
              <div className="w-full text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                {renderHTML(technology.textContent)}
              </div>
            </div>
          ) : hasImage ? (
            // Image göster - Resim kutusu tasarımı
            <div className="lg:w-2/5 w-full flex items-center justify-center">
              <img
                src={technology.imageUrl}
                alt={translation?.title}
                className="w-full h-[500px] md:h-[600px] object-cover rounded-2xl shadow-2xl"
              />
            </div>
          ) : (
            // Fallback: Eğer ne resim ne de text varsa
            <div className="lg:w-2/5 w-full flex items-center justify-center">
              <div className="w-full h-[500px] md:h-[600px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-2xl">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {language === "tr" ? "İçerik bulunmamaktadır." : "No content available."}
                </p>
              </div>
            </div>
          )}

          {/* SAĞ AÇIKLAMA */}
          <div className="lg:w-3/5 w-full flex flex-col">
            <div className="text-lg leading-relaxed text-gray-800">
              {translation?.description ? (
                renderHTML(translation.description)
              ) : null}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* TAB MENÜSÜ */}
      <div className="py-10">
        <div className="container mx-auto px-6">
          {/* Sekme Butonları */}
          <div className="flex justify-center gap-6 mb-10 flex-wrap">
            {Object.entries(tabLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-8 py-3 rounded-2xl font-bold text-lg transition-colors duration-300 ${
                  activeTab === key
                    ? "bg-[#fdf001] text-black shadow-xl"
                    : "bg-transparent border border-[#fdf001] text-black font-thin hover:bg-[#fdf001] hover:cursor-pointer"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sekme İçerikleri */}
          <div className="border border-[#fdf001] rounded-2xl p-8 text-left shadow-xl">
            {activeTab === "description" && (
              <div className="text-lg leading-relaxed text-gray-800">
                {translation?.featuresDescription ? (
                  renderHTML(translation.featuresDescription)
                ) : (
                  <p className="italic text-gray-500">
                    {language === "tr" ? "Açıklama bulunmamaktadır." : "Description not available."}
                  </p>
                )}
              </div>
            )}

            {activeTab === "catalogs" &&
              (technology.catalogs?.length > 0 ? (
                <ul className="flex flex-wrap justify-center gap-6">
                  {technology.catalogs.map((catalog, index) => (
                    <li
                      key={index}
                      className="p-4 rounded-full text-[#fdf001] bg-black inline-block mb-4"
                    >
                        <a
                          href={fixPdfUrl(catalog.fileUrl || catalog.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
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
                          {catalog.name}
                        </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-gray-600">
                  {language === "tr"
                    ? "Katalog bulunmamaktadır."
                    : "No catalogs available."}
                </div>
              ))}

            {activeTab === "contact" && (
              <div className="max-w-2xl mx-auto">
                <ContactForm />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnologyDetails;
