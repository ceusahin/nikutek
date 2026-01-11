import { useEffect, useState } from "react";
import Menu from "../components/admin/Menu";
import PageContent from "../layouts/PageContent";
import Dashboard from "../components/admin/Dashboard";
import FooterSettings from "../components/admin/FooterSettings";
import SocialMediaSettings from "../components/admin/SocialMediaSettings";
import SeoSettings from "../components/admin/SeoSettings";
import PageSeoSettings from "../components/admin/PageSeoSettings";
import CompanyInfoSettings from "../components/admin/CompanyInfoSettings";
import ContactInfoSettings from "../components/admin/ContactInfoSettings";
import AboutSectionSettings from "../components/admin/AboutSectionSettings";
import LogoSettings from "../components/admin/UploadHeader";
import ReferencesSettings from "../components/admin/ReferencesSettings";
import PanelHeader from "../components/admin/PanelHeader";
import useLanguage from "../hooks/useLanguage";
import useAutoLogout from "../hooks/useAutoLogout";
import MainHeroSettings from "../components/admin/MainHeroSettings";
import MapSettings from "../components/admin/MapSettings";
import ProductControl from "../components/admin/ProductControl";
import ChangePassword from "../components/admin/ChangePassword";
import MessagesSettings from "../components/admin/MessagesSettings";
import TechnologySettings from "../components/admin/TechnologySettings";
import BlogSettings from "../components/admin/BlogSettings";
import AdminLogs from "../components/admin/AdminLogs";
import StockSettings from "../components/admin/StockSettings";
import AutoLogoutWarning from "../components/admin/AutoLogoutWarning";
import { PanelContext } from "../contexts/PanelContext";
import { showInfo } from "../utils/toast";

function Panel() {
  const [activePage, setActivePage] = useState("anasayfa");
  const [activeContentItem, setActiveContentItem] = useState("");
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const { language } = useLanguage();
  
  // 5 dakika hareketsizlik sonrası otomatik logout (30 saniye önce uyarı)
  const { showWarning, warningSeconds, resetTimer, logout } = useAutoLogout(
    5 * 60 * 1000,  // 5 dakika = 300000ms
    30 * 1000       // 30 saniye uyarı
  );

  // Hoşgeldin mesajı (sadece ilk mount'ta göster)
  useEffect(() => {
    const username = sessionStorage.getItem("adminUsername");
    const hasShownWelcome = sessionStorage.getItem("hasShownWelcome");
    
    if (username && !hasShownWelcome) {
      setTimeout(() => {
        showInfo(`Tekrar hoş geldiniz, ${username}! 🎉`);
        sessionStorage.setItem("hasShownWelcome", "true");
      }, 800);
    }
  }, []);

  useEffect(() => {
    if (language == "tr") {
      document.title = "BRSM Yönetim Paneli";
    } else {
      document.title = "BRSM Admin Panel";
    }
  }, [language, activePage, activeContentItem]);

  const toggleMenu = () => {
    setIsMenuCollapsed(!isMenuCollapsed);
  };

  return (
    <PanelContext.Provider
      value={{
        activePage,
        setActivePage,
        activeContentItem,
        setActiveContentItem,
      }}
    >
      {/* Auto Logout Warning Modal */}
      {showWarning && (
        <AutoLogoutWarning
          remainingSeconds={warningSeconds}
          onStayLoggedIn={resetTimer}
          onLogout={logout}
        />
      )}
      
      <PageContent>
        <div className="flex dark:bg-[#101010] overflow-x-hidden">
          <Menu
            activePage={activePage}
            activeContentItem={activeContentItem}
            isCollapsed={isMenuCollapsed}
            onToggle={toggleMenu}
            onSelect={(key) => {
              if (
                [
                  "anasayfa-icerik",
                  "hakkimizda",
                  "urunler",
                  "teknolojiler",
                  "blog",
                  "referanslar",
                  "iletisim",
                ].includes(key)
              ) {
                setActiveContentItem(key);
                setActivePage(null);
              } else {
                setActivePage(key);
                setActiveContentItem(null);
              }
            }}
          />
          <div
            className={`flex-1 transition-all duration-300 overflow-x-hidden dark:bg-[#101010] ${
              isMenuCollapsed ? "md:ml-16" : "md:ml-72"
            } ml-0`}
          >
            {activeContentItem ? (
              <>
                {activeContentItem === "anasayfa-icerik" && (
                  <div className="p-4 md:p-8 lg:p-14 pt-20 md:pt-24 lg:pt-30 space-y-4 md:space-y-6 dark:text-white dark:from-slate-900 dark:to-slate-800 bg-gradient-to-br from-slate-50 to-blue-50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <h1 className="text-sm md:text-base font-light">Yönetim Paneli</h1>
                      <span className="hidden sm:inline">/</span>
                      <h1 className="text-sm md:text-base font-light">İçerik Ayarları</h1>
                      <span className="hidden sm:inline">/</span>
                      <h1 className="text-lg md:text-xl font-bold">Ana Sayfa</h1>
                    </div>
                    <div className="flex flex-col gap-4 mb-8">
                      <MainHeroSettings />
                      <ContactInfoSettings />
                    </div>
                  </div>
                )}
                {activeContentItem === "hakkimizda" && (
                  <div className="pt-20 md:pt-24 lg:pt-30 px-4 md:px-6 lg:px-8 pb-6 dark:text-white dark:from-slate-900 dark:to-slate-800 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6">
                      <h1 className="text-sm md:text-base font-light">Yönetim Paneli</h1>
                      <span className="hidden sm:inline">/</span>
                      <h1 className="text-sm md:text-base font-light">İçerik Ayarları</h1>
                      <span className="hidden sm:inline">/</span>
                      <h1 className="text-lg md:text-xl font-bold">Hakkımızda</h1>
                    </div>
                    <AboutSectionSettings />
                  </div>
                )}
                {activeContentItem === "urunler" && (
                  <div className="pt-20 md:pt-24 lg:pt-30 px-4 md:px-6 lg:px-8 pb-6 dark:text-white dark:from-slate-900 dark:to-slate-800 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6">
                      <h1 className="text-sm md:text-base font-light">Yönetim Paneli</h1>
                      <span className="hidden sm:inline">/</span>
                      <h1 className="text-sm md:text-base font-light">İçerik Ayarları</h1>
                      <span className="hidden sm:inline">/</span>
                      <h1 className="text-lg md:text-xl font-bold">Ürünlerimiz</h1>
                    </div>
                    <ProductControl />
                  </div>
                )}
                {activeContentItem === "teknolojiler" && (
                  <div className="p-4 md:p-8 lg:p-14 space-y-4 md:space-y-6 pt-20 md:pt-24 lg:pt-30 dark:text-white dark:from-slate-900 dark:to-slate-800 bg-gradient-to-br from-slate-50 to-blue-50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <h1 className="text-sm md:text-base font-light">Yönetim Paneli</h1>
                      <span className="hidden sm:inline">/</span>
                      <h1 className="text-sm md:text-base font-light">İçerik Ayarları</h1>
                      <span className="hidden sm:inline">/</span>
                      <h1 className="text-lg md:text-xl font-bold">Teknolojilerimiz</h1>
                    </div>
                    <div>
                      <TechnologySettings />
                    </div>
                  </div>
                )}
                {activeContentItem === "blog" && (
                  <div className="p-4 md:p-8 lg:p-14 space-y-4 md:space-y-6 pt-20 md:pt-24 lg:pt-30 dark:text-white dark:from-slate-900 dark:to-slate-800 bg-gradient-to-br from-slate-50 to-blue-50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <h1 className="text-sm md:text-base font-light">Yönetim Paneli</h1>
                      <span className="hidden sm:inline">/</span>
                      <h1 className="text-sm md:text-base font-light">İçerik Ayarları</h1>
                      <span className="hidden sm:inline">/</span>
                      <h1 className="text-lg md:text-xl font-bold">Blog</h1>
                    </div>
                    <h1>
                      <BlogSettings />
                    </h1>
                  </div>
                )}
                {activeContentItem === "referanslar" && (
                  <div className="p-4 md:p-8 lg:p-14 space-y-4 md:space-y-6 pt-20 md:pt-24 lg:pt-30 dark:text-white dark:from-slate-900 dark:to-slate-800 bg-gradient-to-br from-slate-50 to-blue-50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <h1 className="text-sm md:text-base font-light">Yönetim Paneli</h1>
                      <span className="hidden sm:inline">/</span>
                      <h1 className="text-sm md:text-base font-light">Referans Ayarları</h1>
                      <span className="hidden sm:inline">/</span>
                      <h1 className="text-lg md:text-xl font-bold">Referanslarımız</h1>
                    </div>
                    <div>
                      <ReferencesSettings />
                    </div>
                  </div>
                )}
                {activeContentItem === "iletisim" && (
                  <div className="p-4 md:p-8 lg:p-14 space-y-4 md:space-y-6 pt-20 md:pt-24 lg:pt-30 dark:text-white dark:from-slate-900 dark:to-slate-800 bg-gradient-to-br from-slate-50 to-blue-50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <h1 className="text-sm md:text-base font-light">Yönetim Paneli</h1>
                      <span className="hidden sm:inline">/</span>
                      <h1 className="text-sm md:text-base font-light">Referans Ayarları</h1>
                      <span className="hidden sm:inline">/</span>
                      <h1 className="text-lg md:text-xl font-bold">İletişim</h1>
                    </div>
                    <div>
                      <MapSettings />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {activePage === "anasayfa" && (
                  <Dashboard
                    onlineCount={4}
                    todayOnlineCount={16}
                    monthlyOnlineCount={115}
                    totalOnlineCount={512}
                    isMenuCollapsed={isMenuCollapsed}
                  />
                )}
                {activePage === "site-yonetimi" && (
                  <div className="pt-20 md:pt-24 lg:pt-30 px-4 md:px-6 lg:px-8 pb-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 min-h-screen">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 dark:text-white mb-6">
                      <h1 className="text-sm md:text-base font-light">Yönetim Paneli</h1>
                      <span className="hidden sm:inline">/</span>
                      <h1 className="text-lg md:text-xl font-bold">Site Yönetimi</h1>
                    </div>
                    <div className="flex flex-col gap-4 md:gap-6 w-full">
                      <LogoSettings />
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 w-full">
                        <CompanyInfoSettings />
                        <FooterSettings />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 w-full">
                        <SocialMediaSettings />
                        <SeoSettings />
                      </div>
                      <PageSeoSettings />
                    </div>
                  </div>
                )}
                {activePage === "stock-yonetimi" && (
                  <div className="pt-20 md:pt-24 lg:pt-30 px-4 md:px-6 lg:px-8 pb-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 min-h-screen overflow-x-hidden">
                    <StockSettings />
                  </div>
                )}

                {activePage === "mesajlar" && (
                  <div className="p-4 md:p-8 lg:p-14 pt-20 md:pt-24 lg:pt-30 space-y-4 md:space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 min-h-screen">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 dark:text-white">
                      <h1 className="text-sm md:text-base font-light">Yönetim Paneli</h1>
                      <span className="hidden sm:inline">/</span>
                      <h1 className="text-lg md:text-xl font-bold">Mesajlar</h1>
                    </div>
                    <div className="flex gap-4 mb-8">
                      <MessagesSettings />
                    </div>
                  </div>
                )}

                {activePage === "kullanicilar" && (
                  <div className="pt-20 md:pt-24 lg:pt-30 px-4 md:px-6 lg:px-8 pb-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 min-h-screen">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6">
                      <h1 className="text-sm md:text-base font-light dark:text-white">Yönetim Paneli</h1>
                      <span className="text-gray-500 dark:text-white hidden sm:inline">/</span>
                      <h1 className="text-lg md:text-xl font-bold text-gray-700 dark:text-white">
                        Kullanıcılar
                      </h1>
                    </div>
                    <ChangePassword />
                    <AdminLogs />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div>
          <PanelHeader />
        </div>
      </PageContent>
    </PanelContext.Provider>
  );
}

export default Panel;
