import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";
import { getLocalizedPath } from "../../utils/routeUtils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import renderHTML from "../../utils/renderHTML";

function ProductSlider() {
  const { language } = useLanguage();
  const { slug } = useParams(); // Mevcut sayfa slug'ı
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Her ürün için seçili hz değerini tut (ürün id -> seçili hz)
  const [selectedFrequencies, setSelectedFrequencies] = useState({});
  
  // Responsive görüntülenecek ürün sayısı
  const getItemsToShow = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 1; // Mobil: 1
    if (width < 768) return 2; // Tablet: 2
    if (width < 1024) return 3; // Küçük desktop: 3
    return 4; // Desktop: 4
  };
  
  const [itemsToShow, setItemsToShow] = useState(getItemsToShow());
  
  useEffect(() => {
    const handleResize = () => {
      setItemsToShow(getItemsToShow());
      setCurrentIndex(0); // Ekran boyutu değiştiğinde başa dön
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/products");
        
        // Tüm ürünleri düzleştir (parent ve children)
        const allProducts = [];
        const flattenProducts = (productList) => {
          productList.forEach((product) => {
            // Sadece alt ürünleri ekle (parentId !== null)
            if (product.parentId !== null && product.active !== false) {
              // Mevcut dilde çevirisi olanları filtrele
              const hasTranslation = product.translations?.some(
                (t) => t.langCode === language
              );
              if (hasTranslation) {
                allProducts.push(product);
              }
            }
            // Children varsa onları da ekle
            if (product.children && product.children.length > 0) {
              flattenProducts(product.children);
            }
          });
        };
        
        flattenProducts(res.data || []);
        
        // displayOrder'a göre sırala (parentId'ye göre grupla ve her grup içinde sırala)
        const sortedProducts = allProducts.sort((a, b) => {
          // Önce parentId'ye göre grupla
          if (a.parentId !== b.parentId) {
            return (a.parentId ?? 0) - (b.parentId ?? 0);
          }
          // Aynı parent altındaysa displayOrder'a göre sırala
          const orderA = a.displayOrder ?? a.display_order ?? a.order ?? a.id ?? 0;
          const orderB = b.displayOrder ?? b.display_order ?? b.order ?? b.id ?? 0;
          return orderA - orderB;
        });
        
        // Mevcut sayfadaki ürünü filtrele (eğer alt ürün sayfasındaysak)
        const filteredProducts = sortedProducts.filter((product) => {
          const translation = product.translations?.find(
            (t) => t.langCode === language
          );
          return translation?.slug !== slug;
        });
        
        setProducts(filteredProducts);
      } catch (err) {
        console.error("Ürünler alınamadı:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, [language, slug]);

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, products.length - itemsToShow);
      return prev > 0 ? prev - 1 : maxIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, products.length - itemsToShow);
      return prev < maxIndex ? prev + 1 : 0;
    });
  };

  const handleProductClick = (product) => {
    const translation = product.translations?.find(
      (t) => t.langCode === language
    ) || product.translations?.[0];
    
    if (translation?.slug) {
      navigate(getLocalizedPath("projectDetail", translation.slug, language));
    } else if (product.id) {
      navigate(getLocalizedPath("projectDetail", product.id, language));
    }
  };

  if (loading) {
    return null; // Yüklenirken hiçbir şey gösterme
  }

  if (products.length === 0) {
    return null; // Ürün yoksa hiçbir şey gösterme
  }

  return (
    <div className="w-full py-8 md:py-12 px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-44 bg-white dark:bg-gray-900">
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {language === "tr" ? "Diğer Ürünlerimiz" : "Our Other Products"}
        </h2>
      </div>

      <div className="relative">
        {/* Önceki buton */}
        {products.length > itemsToShow && (
          <button
            onClick={handlePrev}
            className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Önceki"
          >
            <ChevronLeft size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
        )}

        {/* Ürünler */}
        <div className="overflow-hidden mx-8 sm:mx-12">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              gap: '1rem',
              transform: `translateX(calc(-${currentIndex} * ((100% - ${(itemsToShow - 1) * 1}rem) / ${itemsToShow} + 1rem)))`,
            }}
          >
            {products.map((product) => {
              const translation = product.translations?.find(
                (t) => t.langCode === language
              ) || product.translations?.[0];
              
              // Ürün adına göre içerik belirleme
              const productTitle = (translation?.title || "").toLowerCase();
              const isNikuniPump = productTitle.includes("nikuni") || productTitle.includes("pompa");
              const isVdf = productTitle.includes("vdf");
              
              // Nikuni pompa ise özellikler, VDF ise açıklama göster
              const allFeatures = product.features || [];
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
              
              const showFeatures = isNikuniPump && filteredFeatures.length > 0;
              const showDescription = isVdf && translation?.description;
              
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
                  className="flex-shrink-0 cursor-pointer group"
                  style={{ 
                    width: `calc((100% - ${(itemsToShow - 1) * 1}rem) / ${itemsToShow})`,
                  }}
                  onClick={() => handleProductClick(product)}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                    {/* Ürün Görseli */}
                    <div className="aspect-square overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                      <img
                        src={product.imageUrl || "/images/default.webp"}
                        alt={translation?.title || "Product"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Ürün Bilgisi */}
                    <div className="p-4 flex-1 flex flex-col min-h-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 flex-shrink-0">
                        {translation?.title || (language === "tr" ? "Ürün" : "Product")}
                      </h3>
                      
                      {/* Hz Seçici - Yan yana butonlar */}
                      {isNikuniPump && availableFrequencies.length > 0 && (
                        <div className="mb-2 flex-shrink-0 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Hz:
                          </span>
                          <div className="flex gap-1.5">
                            {availableFrequencies.map((freq) => (
                              <button
                                key={freq}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFrequencyChange(freq);
                                }}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
                                  selectedFreq === freq
                                    ? "bg-blue-600 text-white shadow-md scale-105"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                              >
                                {freq}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Nikuni Pompa ise özellikler göster */}
                      {showFeatures && (
                        <div className="flex-1 space-y-1 min-h-0 overflow-hidden">
                          {filteredFeatures.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">{feature.name}:</span>{" "}
                              <span>{feature.value}</span>
                            </div>
                          ))}
                          {filteredFeatures.length > 3 && (
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              +{filteredFeatures.length - 3} {language === "tr" ? "özellik daha" : "more features"}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* VDF ise açıklama göster */}
                      {showDescription && !showFeatures && (
                        <div className="flex-1 min-h-0 overflow-hidden">
                          <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 h-full">
                            {renderHTML(translation.description)}
                          </div>
                        </div>
                      )}
                      
                      {/* Ne özellik ne açıklama varsa, genel açıklama göster */}
                      {!showFeatures && !showDescription && translation?.description && (
                        <div className="flex-1 min-h-0 overflow-hidden">
                          <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 h-full">
                            {renderHTML(translation.description)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sonraki buton */}
        {products.length > itemsToShow && (
          <button
            onClick={handleNext}
            className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Sonraki"
          >
            <ChevronRight size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
        )}
      </div>

      {/* Dots indicator */}
      {products.length > itemsToShow && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(products.length / itemsToShow) }).map(
            (_, index) => {
              const pageIndex = index * itemsToShow;
              const isActive = currentIndex >= pageIndex && currentIndex < pageIndex + itemsToShow;
              return (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(pageIndex)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isActive
                      ? "bg-blue-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label={`Sayfa ${index + 1}`}
                />
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

export default ProductSlider;

