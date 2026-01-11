import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";

function SeoMetaUpdater() {
  const { language } = useLanguage();
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    // Sayfa tipini belirle
    const getPageType = () => {
      const path = location.pathname;
      
      // Ana sayfa
      if (path === "/" || path === "") {
        return "home";
      }
      
      // Hakkımızda
      if (path.includes("/hakkimizda") || path.includes("/about")) {
        return "about";
      }
      
      // Teknolojiler
      if (path.includes("/teknolojilerimiz") || path.includes("/technologies")) {
        // Kategori sayfası değilse ve path'te slug varsa (örn: /technologies/some-slug)
        const pathParts = path.split("/").filter(p => p);
        const isTechnologiesPath = pathParts[0] === "teknolojilerimiz" || pathParts[0] === "technologies";
        if (isTechnologiesPath && pathParts.length > 1 && !pathParts[1].includes("kategori") && !pathParts[1].includes("category")) {
          return "technology_detail";
        }
        return "technologies";
      }
      
      // Ürünler
      if (path.includes("/urunlerimiz") || path.includes("/products")) {
        // Kategori sayfası
        if (path.includes("/kategori") || path.includes("/category")) {
          return "category_products";
        }
        // Path'te slug varsa (örn: /products/some-slug veya /urunlerimiz/some-slug)
        const pathParts = path.split("/").filter(p => p);
        const isProductsPath = pathParts[0] === "urunlerimiz" || pathParts[0] === "products";
        if (isProductsPath && pathParts.length > 1) {
          return "product_detail";
        }
        return "products";
      }
      
      // Blog
      if (path.includes("/blog")) {
        return "blog";
      }
      
      // Referanslar
      if (path.includes("/referanslarimiz") || path.includes("/references")) {
        return "references";
      }
      
      // İletişim
      if (path.includes("/iletisim") || path.includes("/contact")) {
        return "contact";
      }
      
      // Varsayılan olarak home
      return "home";
    };

    const pageType = getPageType();
    // Slug'ı params'tan veya path'ten al
    let slug = params.slug;
    if (!slug) {
      // Eğer params.slug yoksa, path'ten çıkar
      const pathParts = location.pathname.split("/").filter(p => p);
      if (pageType === "product_detail") {
        const productsIndex = pathParts.findIndex(p => p === "urunlerimiz" || p === "products");
        if (productsIndex !== -1 && pathParts.length > productsIndex + 1) {
          slug = pathParts[productsIndex + 1];
        }
      } else if (pageType === "technology_detail") {
        const techIndex = pathParts.findIndex(p => p === "teknolojilerimiz" || p === "technologies");
        if (techIndex !== -1 && pathParts.length > techIndex + 1) {
          slug = pathParts[techIndex + 1];
        }
      }
    }
    
    // Meta tag güncelleme fonksiyonu
    const setMeta = (name, content, property = false) => {
      const selector = property 
        ? `meta[property="${name}"]` 
        : `meta[name="${name}"]`;
      let element = document.querySelector(selector);
      
      if (!element) {
        element = document.createElement("meta");
        if (property) {
          element.setAttribute("property", name);
        } else {
          element.setAttribute("name", name);
        }
        document.head.appendChild(element);
      }
      
      if (content) {
        element.setAttribute("content", content);
      } else {
        element.setAttribute("content", "");
      }
    };

    // Ürün veya teknoloji detay sayfasındaysa, sadece o ürünün/teknolojinin kendi SEO'sunu çek
    if ((pageType === "product_detail" || pageType === "technology_detail") && slug) {
      const endpoint = pageType === "product_detail" 
        ? `/products/slug/${slug}?lang=${language}`
        : `/technologies/slug/${slug}?lang=${language}`;
      
      axiosInstance.get(endpoint)
        .then((res) => {
          const item = res.data;
          const translation = item.translations?.find(t => t.langCode === language) || item.translations?.[0];
          
          // Eğer bu ürünün/teknolojinin kendi SEO ayarları varsa, onları kullan
          if (translation) {
            // SEO alanlarını kontrol et (boş string, null, undefined değilse kullan)
            const hasSeoTitle = translation.seoTitle && translation.seoTitle.trim() !== "";
            const hasSeoDescription = translation.seoDescription && translation.seoDescription.trim() !== "";
            const hasSeoKeywords = translation.seoKeywords && translation.seoKeywords.trim() !== "";
            const hasSeoOgTitle = translation.seoOgTitle && translation.seoOgTitle.trim() !== "";
            const hasSeoOgDescription = translation.seoOgDescription && translation.seoOgDescription.trim() !== "";
            const hasSeoOgImage = translation.seoOgImage && translation.seoOgImage.trim() !== "";
            
            // Eğer herhangi bir SEO alanı doldurulmuşsa, SEO ayarlarını kullan
            if (hasSeoTitle || hasSeoDescription || hasSeoKeywords || hasSeoOgTitle || hasSeoOgDescription || hasSeoOgImage) {
              document.title = hasSeoTitle ? translation.seoTitle : (translation.title || "Nikutek");
              setMeta("title", hasSeoTitle ? translation.seoTitle : (translation.title || ""));
              setMeta("description", hasSeoDescription ? translation.seoDescription : (translation.description || ""));
              setMeta("keywords", hasSeoKeywords ? translation.seoKeywords : "");
              setMeta("og:title", hasSeoOgTitle ? translation.seoOgTitle : (hasSeoTitle ? translation.seoTitle : (translation.title || "")), true);
              setMeta("og:description", hasSeoOgDescription ? translation.seoOgDescription : (hasSeoDescription ? translation.seoDescription : (translation.description || "")), true);
              setMeta("og:image", hasSeoOgImage ? translation.seoOgImage : "", true);
              setMeta("og:type", "website", true);
              setMeta("og:url", window.location.href, true);
              return;
            }
          }
          
          // Eğer kendi SEO'su yoksa, eski global SEO'yu kullan (genel sayfa tipi SEO'sunu kullanma)
          return axiosInstance.get("/seo");
        })
        .then((res) => {
          if (!res) return; // Eğer yukarıdaki if'ten return edildiyse, res yok
          
          // Global SEO fallback
          const data = res.data;
          document.title = data.title || "Nikutek";
          setMeta("title", data.title);
          setMeta("description", data.description);
          setMeta("keywords", data.keywords);
          setMeta("og:title", data.ogTitle || data.title, true);
          setMeta("og:description", data.ogDescription || data.description, true);
          setMeta("og:image", data.ogImage, true);
          setMeta("og:type", "website", true);
          setMeta("og:url", window.location.href, true);
        })
        .catch(() => {
          // SEO yüklenemedi, sessizce devam et
        });
    } else {
      // Diğer sayfalar için genel sayfa tipi SEO'sunu kullan
      const seoUrl = `/page-seo/${pageType}/${language}`;
      
      axiosInstance.get(seoUrl)
        .then((res) => {
          const data = res.data;
          document.title = data.title || "Nikutek";
          setMeta("title", data.title);
          setMeta("description", data.description);
          setMeta("keywords", data.keywords);
          setMeta("og:title", data.ogTitle || data.title, true);
          setMeta("og:description", data.ogDescription || data.description, true);
          setMeta("og:image", data.ogImage, true);
          setMeta("og:type", "website", true);
          setMeta("og:url", window.location.href, true);
        })
        .catch((err) => {
          // 404 hatası - sayfa tipine özel SEO yok, global SEO'yu kullan (sessizce handle et)
          if (err.response?.status === 404 || err.code === 'ERR_NETWORK') {
            axiosInstance.get("/seo").then((res) => {
              const data = res.data;
              document.title = data.title || "Nikutek";
              setMeta("title", data.title);
              setMeta("description", data.description);
              setMeta("keywords", data.keywords);
              setMeta("og:title", data.ogTitle || data.title, true);
              setMeta("og:description", data.ogDescription || data.description, true);
              setMeta("og:image", data.ogImage, true);
              setMeta("og:type", "website", true);
              setMeta("og:url", window.location.href, true);
            }).catch(() => {
              // Global SEO da yüklenemedi, sessizce devam et
            });
          } else {
            // Diğer hatalar için de global SEO'yu dene
            axiosInstance.get("/seo").then((res) => {
              const data = res.data;
              document.title = data.title || "Nikutek";
              setMeta("title", data.title);
              setMeta("description", data.description);
              setMeta("keywords", data.keywords);
              setMeta("og:title", data.ogTitle || data.title, true);
              setMeta("og:description", data.ogDescription || data.description, true);
              setMeta("og:image", data.ogImage, true);
              setMeta("og:type", "website", true);
              setMeta("og:url", window.location.href, true);
            }).catch(() => {
              // Fallback SEO da yüklenemedi, sessizce devam et
            });
          }
        });
    }
  }, [language, location.pathname, params.slug]);

  return null; // Bu component DOM'a bir şey render etmez
}

export default SeoMetaUpdater;
