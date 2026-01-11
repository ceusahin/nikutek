/**
 * Dil-aware routing utility fonksiyonları
 */

// Path haritaları - App.jsx'tekiyle aynı
const paths = {
  tr: {
    about: "hakkimizda",
    services: "teknolojilerimiz",
    serviceDetail: "teknolojilerimiz",
    projects: "urunlerimiz",
    projectDetail: "urunlerimiz",
    category: "urunlerimiz/kategori",
    blog: "blog",
    refs: "referanslarimiz",
    contact: "iletisim",
  },
  en: {
    about: "about",
    services: "technologies",
    serviceDetail: "technologies",
    projects: "products",
    projectDetail: "products",
    category: "products/category",
    blog: "blog",
    refs: "references",
    contact: "contact",
  },
};

/**
 * Mevcut URL'i yeni dile çevirir
 * @param {string} currentPath - Mevcut path (örn: "/urunlerimiz/kategori/test")
 * @param {string} currentLang - Mevcut dil (tr/en)
 * @param {string} newLang - Yeni dil (tr/en)
 * @returns {string} - Yeni dilde path
 */
export const translatePath = (currentPath, currentLang, newLang) => {
  // Anasayfa
  if (currentPath === "/") return "/";

  const currentPaths = paths[currentLang] || paths.tr;
  const newPaths = paths[newLang] || paths.tr;

  // Kategori sayfası: /urunlerimiz/kategori/:slug veya /products/category/:slug
  if (currentPath.includes("/kategori/") || currentPath.includes("/category/")) {
    const slug = currentPath.split("/").pop();
    if (currentPath.includes("/kategori/")) {
      // Türkçe'den İngilizce'ye
      return `/${newPaths.category}/${slug}`;
    } else {
      // İngilizce'den Türkçe'ye
      return `/${newPaths.category}/${slug}`;
    }
  }

  // Ürün detay sayfası: /urunlerimiz/:slug veya /products/:slug
  const trProjectsPath = currentPaths.projects;
  const enProjectsPath = newPaths.projects;
  if (currentPath.startsWith(`/${trProjectsPath}/`) && !currentPath.includes("/kategori")) {
    const slug = currentPath.replace(`/${trProjectsPath}/`, "");
    return `/${newPaths.projectDetail}/${slug}`;
  }
  if (currentPath.startsWith(`/${enProjectsPath}/`) && !currentPath.includes("/category")) {
    const slug = currentPath.replace(`/${enProjectsPath}/`, "");
    return `/${newPaths.projectDetail}/${slug}`;
  }

  // Teknoloji detay sayfası: /teknolojilerimiz/:slug veya /technologies/:slug
  const trServicesPath = currentPaths.serviceDetail;
  const enServicesPath = newPaths.serviceDetail;
  if (currentPath.startsWith(`/${trServicesPath}/`)) {
    const slug = currentPath.replace(`/${trServicesPath}/`, "");
    return `/${enServicesPath}/${slug}`;
  }
  if (currentPath.startsWith(`/${enServicesPath}/`)) {
    const slug = currentPath.replace(`/${enServicesPath}/`, "");
    return `/${newPaths.serviceDetail}/${slug}`;
  }

  // Diğer sayfalar için mapping
  const pathMappings = [
    { tr: "hakkimizda", en: "about" },
    { tr: "teknolojilerimiz", en: "technologies" },
    { tr: "urunlerimiz", en: "products" },
    { tr: "blog", en: "blog" },
    { tr: "referanslarimiz", en: "references" },
    { tr: "iletisim", en: "contact" },
  ];

  for (const mapping of pathMappings) {
    // Türkçe path'ten İngilizce'ye
    if (currentLang === "tr" && currentPath === `/${mapping.tr}`) {
      return `/${mapping.en}`;
    }
    // İngilizce path'ten Türkçe'ye
    if (currentLang === "en" && currentPath === `/${mapping.en}`) {
      return `/${mapping.tr}`;
    }
  }
  
  // Eğer aynı dile çeviriliyorsa, path'i aynen döndür
  if (currentLang === newLang) {
    return currentPath;
  }

  // Eğer eşleşme bulunamazsa, anasayfaya yönlendir
  return "/";
};

/**
 * Dil-aware navigate fonksiyonu
 * @param {string} routeType - Route tipi: 'projectDetail', 'category', 'serviceDetail', vb.
 * @param {string} slug - Slug değeri
 * @param {string} language - Mevcut dil
 * @returns {string} - Dil-aware path
 */
export const getLocalizedPath = (routeType, slug, language) => {
  const langPaths = paths[language] || paths.tr;
  
  switch (routeType) {
    case "projectDetail":
      return `/${langPaths.projectDetail}/${slug}`;
    case "category":
      return `/${langPaths.category}/${slug}`;
    case "serviceDetail":
      return `/${langPaths.serviceDetail}/${slug}`;
    case "projects":
      return `/${langPaths.projects}`;
    case "services":
      return `/${langPaths.services}`;
    case "about":
      return `/${langPaths.about}`;
    case "blog":
      return `/${langPaths.blog}`;
    case "refs":
      return `/${langPaths.refs}`;
    case "contact":
      return `/${langPaths.contact}`;
    default:
      return "/";
  }
};

export default { translatePath, getLocalizedPath };

