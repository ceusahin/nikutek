import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";
import { getLocalizedPath } from "../../utils/routeUtils";

const CategoryProducts = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  // Her ürün için seçili hz değerini tut (ürün id -> seçili hz)
  const [selectedFrequencies, setSelectedFrequencies] = useState({});

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        // Slug ile kategoriyi çek
        const res = await axiosInstance.get(`/products/slug/${slug}?lang=${language}`);
        const data = res.data;

        // Eğer ürün aktif değilse veya alt ürünü yoksa
        if (!data || data.active === false) {
          setCategory(null);
          return;
        }

        // Sadece mevcut dilde çevirisi olan aktif alt ürünleri al
        const activeChildren = (data.children || []).filter(
          (child) => 
            child.active !== false &&
            child.translations?.some((t) => t.langCode === language)
        );

        // displayOrder'a göre sırala
        const sortedChildren = activeChildren.sort((a, b) => {
          const orderA = a.displayOrder ?? a.display_order ?? a.order ?? a.id ?? 0;
          const orderB = b.displayOrder ?? b.display_order ?? b.order ?? b.id ?? 0;
          return orderA - orderB;
        });

        setCategory({ ...data, children: sortedChildren });
      } catch (err) {
        console.error("Kategori alınamadı:", err);
        setCategory(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategory();
    }
  }, [slug, language]);

  if (loading)
    return (
      <div className="text-center mt-20 text-xl animate-pulse">
        {language === "tr" ? "Yükleniyor..." : "Loading..."}
      </div>
    );

  if (!category || !category.children || category.children.length === 0)
    return (
      <div className="text-center mt-20 text-xl">
        {language === "tr" ? "Kategori veya ürün bulunamadı." : "Category or product not found."}
      </div>
    );

  // Dil seçimine göre çeviri
  const categoryTranslation =
    category.translations?.find((t) => t.langCode === language) ||
    category.translations?.[0] ||
    {};

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 py-10 md:py-16 lg:py-20 mt-14 xl:mt-40">
      {/* Başlık */}
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-black">
          {categoryTranslation.title || (language === "tr" ? "Kategori" : "Category")}
        </h1>
        <div className="w-24 h-1 bg-[#fdf001] mx-auto rounded-full"></div>
      </div>

      {/* Ürün Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {category.children.map((product) => {
          const translation =
            product.translations?.find((t) => t.langCode === language) ||
            product.translations?.[0] ||
            {};
          const allFeatures = product.features || [];
          
          // Mevcut dildeki özellikleri filtrele
          const currentLanguageFeatures = allFeatures.filter(
            (f) => f.langCode === language
          );
          
          // Ürünün sahip olduğu hz değerlerini bul
          const availableFrequencies = [
            ...new Set(
              currentLanguageFeatures
                .map((f) => f.frequency)
                .filter((f) => f !== null && f !== undefined)
            ),
          ].sort((a, b) => a - b);
          
          // Seçili hz değeri (varsayılan olarak ilk mevcut hz veya null)
          const selectedFreq = selectedFrequencies[product.id] ?? 
            (availableFrequencies.length > 0 ? availableFrequencies[0] : null);
          
          // Seçili hz'e göre özellikleri filtrele
          const filteredFeatures = selectedFreq !== null
            ? currentLanguageFeatures.filter((f) => f.frequency === selectedFreq)
            : currentLanguageFeatures.filter((f) => f.frequency === null || f.frequency === undefined);
          
          const productSlug = translation?.slug;
          
          // Hz seçici değiştiğinde
          const handleFrequencyChange = (freq) => {
            setSelectedFrequencies((prev) => ({
              ...prev,
              [product.id]: freq,
            }));
          };
          
          return (
            <div
              key={product.id}
              onClick={() => {
                if (productSlug) {
                  navigate(getLocalizedPath("projectDetail", productSlug, language));
                } else {
                  navigate(getLocalizedPath("projectDetail", product.id, language));
                }
              }}
              className="group cursor-pointer flex flex-col
                         bg-black rounded-2xl md:rounded-3xl overflow-hidden 
                         shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_50px_#fdf001aa] 
                         transition-all duration-500 hover:scale-[1.02]"
            >
              {/* Ürün Görseli */}
              <div className="relative w-full h-[250px] sm:h-[280px] md:h-[320px] lg:h-[360px] overflow-hidden">
                <img
                  src={product.imageUrl || "/images/default.webp"}
                  alt={translation.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* İçerik - Siyah Arkaplan */}
              <div className="flex-1 bg-black p-4 md:p-6 flex flex-col">
                {/* Ürün Başlığı */}
                <h2 className="text-xl md:text-2xl font-bold mb-3 text-white group-hover:text-[#fdf001] transition-colors duration-300 line-clamp-2">
                  {translation.title || (language === "tr" ? "Ürün" : "Product")}
                </h2>

                {/* Hz Seçici - Yan yana butonlar */}
                {availableFrequencies.length > 0 && (
                  <div className="mb-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs font-medium text-gray-400 mr-1">
                      {language === "tr" ? "Hz:" : "Hz:"}
                    </span>
                    <div className="flex gap-2">
                      {availableFrequencies.map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFrequencyChange(freq);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            selectedFreq === freq
                              ? "bg-[#fdf001] text-black shadow-lg scale-105"
                              : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:border-gray-600"
                          }`}
                        >
                          {freq} Hz
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Özellikler (Filtrelenmiş özellikler, ilk 4 tanesi gösterilir) */}
                {filteredFeatures.length > 0 && (
                  <div className="mb-4 space-y-2 flex-1">
                    {filteredFeatures.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm md:text-base">
                        <span className="text-[#fdf001] font-semibold min-w-fit">
                          {f.name}:
                        </span>
                        <span className="text-gray-300 truncate">{f.value}</span>
                      </div>
                    ))}
                    {filteredFeatures.length > 4 && (
                      <p className="text-gray-400 text-xs md:text-sm">
                        +{filteredFeatures.length - 4} {language === "tr" ? "özellik daha" : "more features"}
                      </p>
                    )}
                  </div>
                )}

                {/* Buton */}
                <div className="mt-auto pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-[#fdf001] font-semibold text-sm md:text-base group-hover:translate-x-2 transition-transform duration-300">
                      {language === "tr" ? "Detayları Gör" : "View Details"}
                    </span>
                    <svg 
                      className="w-5 h-5 text-[#fdf001] group-hover:translate-x-2 transition-transform duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryProducts;
