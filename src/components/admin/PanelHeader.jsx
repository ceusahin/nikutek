import {
  Search,
  LogOut,
  Bell,
  User,
  Settings,
  Menu as MenuIcon,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useLanguage from "../../hooks/useLanguage";
import ThemeToggle from "../../utils/ThemeToggle";
import LanguageSelector from "./LanguageSelector";

function PanelHeader({ isCollapsed, onMenuToggle }) {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    navigate("/login");
  };

  const goToSite = () => {
    window.open("https://www.nikutek.com.tr", "_blank");
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0
    bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-30
    transition-all duration-300
    ${isCollapsed ? "md:left-16" : "md:left-72"} md:right-0
  `}
    >
      <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        {/* Sol Kısım */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <MenuIcon className="text-gray-700 dark:text-gray-300" size={20} />
          </button>
        </div>

        {/* Sağ Kısım */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobil Siteye Git Butonu */}
          <button
            onClick={goToSite}
            className="md:hidden p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
            title={language === "tr" ? "Siteyi Görüntüle" : "View Site"}
          >
            <ExternalLink className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector />
          </div>

          <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

          <button className="hidden md:flex p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Settings className="h-5 w-5" />
          </button>
          <button className="hidden md:flex p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <User className="h-5 w-5" />
          </button>

          <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

          {/* Siteye Git Butonu */}
          <button
            onClick={goToSite}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            title={language === "tr" ? "Siteyi Görüntüle" : "View Site"}
          >
            <ExternalLink className="h-4 w-4" />
            <span>{language === "tr" ? "Siteye Git" : "Go to Site"}</span>
          </button>

          {/* Çıkış Butonu */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>{language === "tr" ? "Çıkış Yap" : "Logout"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default PanelHeader;
