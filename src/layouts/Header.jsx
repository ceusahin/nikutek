import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import useLanguage from "../hooks/useLanguage";
import { translatePath } from "../utils/routeUtils";

function Header() {
  const [logo, setLogo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [languages, setLanguages] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const { language, setLanguage } = useLanguage(); // tr | en | bg

  useEffect(() => {
    axiosInstance
      .get("/logo")
      .then((res) => setLogo(res.data))
      .catch(() => setLogo(null));

    fetchLanguages();
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const menuTranslations = {
    tr: [
      { label: "ANA SAYFA", path: "/" },
      { label: "HAKKIMIZDA", path: "/hakkimizda" },
      { label: "TEKNOLOJİLERİMİZ", path: "/teknolojilerimiz" },
      { label: "ÜRÜNLERİMİZ", path: "/urunlerimiz" },
      { label: "BLOG", path: "/blog" },
      { label: "REFERANSLAR", path: "/referanslarimiz" },
      { label: "İLETİŞİM", path: "/iletisim" },
    ],
    en: [
      { label: "HOME", path: "/" },
      { label: "ABOUT US", path: "/about" },
      { label: "OUR TECHNOLOGIES", path: "/technologies" },
      { label: "PRODUCTS", path: "/products" },
      { label: "BLOG", path: "/blog" },
      { label: "REFERENCES", path: "/references" },
      { label: "CONTACT", path: "/contact" },
    ],
  };

  const menuItems = menuTranslations[language] || menuTranslations.tr;

  const handleLanguageChange = (newLang) => {
    // Mevcut path'i yeni dile çevir
    const newPath = translatePath(location.pathname, language, newLang);
    
    // Dil değiştir
    setLanguage(newLang);
    setMenuOpen(false);
    
    // Yeni path'e yönlendir (kısa bir gecikme ile state güncellenmesi için)
    setTimeout(() => {
      navigate(newPath);
    }, 100);
  };

  const fetchLanguages = async () => {
    try {
      const res = await axiosInstance.get("/languages");
      setLanguages(res.data); // Örn: [{ code: "tr", name: "Türkçe" }, { code: "en", name: "English" }]
      // console.log(res.data);
    } catch (err) {
      console.error("Dil çekme hatası:", err);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black text-white px-6 xl:px-40 shadow-md">
      <div className="py-3 flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center cursor-pointer"
        >
          {logo && (
            <img
              src={logo.imageUrl}
              alt="Site Logo"
              className="w-34 h-16 object-contain"
            />
          )}
        </div>

        {/* Masaüstü Menü */}
        <div className="hidden md:flex items-center space-x-8">
          <ul className="flex space-x-6 text-base">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `group relative font-bold inline-block transition-colors duration-300 ${
                      isActive
                        ? "text-[#FDF001]"
                        : "text-white hover:text-yellow-100"
                    }`
                  }
                >
                  {item.label}
                  <span
                    className={`absolute left-0 bottom-0 h-[2px] bg-[#FDF001] transition-all duration-300 ${
                      location.pathname === item.path
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  ></span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* --- Dil Seçici (Masaüstü) --- */}
          {languages.length > 0 && (
            <div className="flex items-center border border-[#fdf001]/60 rounded-md px-2 py-1 text-sm font-bold">
              {languages.map((lang, index) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`px-2 transition-colors duration-200 cursor-pointer ${
                    language === lang.code
                      ? "text-[#fdf001]"
                      : "text-white hover:text-[#fdf001]"
                  }`}
                >
                  {lang.code.toUpperCase()}
                  {index !== languages.length - 1 && (
                    <span className="ml-3 text-gray-500">|</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobil Menü Butonu */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-white hover:text-[#FDF001] focus:outline-none"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* --- Mobil Menü --- */}
      <div
        className={`md:hidden fixed top-[64px] left-0 w-full bg-black text-[#fdf001] transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col space-y-4 py-6 px-6 text-center font-semibold text-lg">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `relative block py-2 transition-colors duration-300 ${
                    isActive
                      ? "text-[#fdf001] after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:w-1/2 after:h-[2px] after:bg-[#fdf001]"
                      : "text-[#fdf001] hover:text-yellow-200"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* --- Mobil Dil Seçici --- */}
        {languages.length > 0 && (
          <div className="flex justify-center space-x-4 pb-6 border-t border-[#fdf001]/20 pt-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`text-base font-semibold transition-colors duration-200 ${
                  language === lang.code
                    ? "text-[#fdf001]"
                    : "text-white hover:text-[#fdf001]"
                }`}
              >
                {lang.code.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
