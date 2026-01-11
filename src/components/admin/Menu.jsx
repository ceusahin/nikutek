import { useState } from "react";
import {
  Home,
  Settings,
  Mail,
  Users,
  Info,
  Package,
  Cpu,
  BookOpen,
  Award,
  Warehouse,
  ChevronRight,
  ChevronLeft,
  Map,
  Menu as MenuIcon,
  X,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { label: "Ana Sayfa", key: "anasayfa", icon: Home },
  { label: "Site Yönetimi", key: "site-yonetimi", icon: Settings },
  { label: "Stok Yönetimi", key: "stock-yonetimi", icon: Warehouse },
  { label: "Mesajlar", key: "mesajlar", icon: Mail },
  { label: "Kullanıcılar", key: "kullanicilar", icon: Users },
];

const contentItems = [
  { label: "Ana Sayfa", key: "anasayfa-icerik", icon: Home },
  { label: "Hakkımızda", key: "hakkimizda", icon: Info },
  { label: "Ürünler", key: "urunler", icon: Package },
  { label: "Teknolojiler", key: "teknolojiler", icon: Cpu },
  { label: "Blog", key: "blog", icon: BookOpen },
  { label: "Referanslar", key: "referanslar", icon: Award },
  { label: "İletişim", key: "iletisim", icon: Map },
];

const Menu = ({
  onSelect,
  activePage,
  activeContentItem,
  isCollapsed,
  onToggle,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isActive = (key) => activePage === key || activeContentItem === key;

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <>
      {/* Mobil Menü Butonu */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-3 left-4 z-50 bg-gray-900 p-2 rounded-md shadow-lg border border-gray-700"
      >
        <MenuIcon className="text-white" size={24} />
      </button>

      {/* Masaüstü Menü */}
      <div
        className={`hidden md:flex fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white z-40 flex-col shadow-2xl border-r border-slate-700 transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-72"
        }`}
      >
        <MenuContent
          {...{
            onSelect,
            isActive,
            isCollapsed,
            onToggle,
          }}
        />
      </div>

      {/* Mobil Menü Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobil Menü */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white z-50 shadow-2xl transform transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Üst Bar */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <img
              src="/images/brsm-siyah-logo.webp"
              alt="Logo"
              className="h-8 w-8 object-contain rounded bg-white/80 p-1"
            />
            <span className="text-lg font-bold">NIKUTEK</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-slate-700 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-60px)] p-4 flex flex-col justify-between">
          <div>
            <MenuContent
              {...{
                onSelect,
                isActive,
                isCollapsed: false,
                onToggle: () => {},
              }}
            />
          </div>

          {/* Çıkış Butonu (mobil menü altına eklendi) */}
          <button
            onClick={handleLogout}
            className="w-full my-4 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>
    </>
  );
};

const MenuContent = ({ onSelect, isActive, isCollapsed, onToggle }) => (
  <>
    {/* Masaüstü Header */}
    <div className="border-b border-slate-700 p-6 md:block hidden">
      <div
        className={`flex items-center gap-3 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed && (
          <>
            <div className="flex items-center gap-3">
              <img
                src="/images/brsm-siyah-logo.webp"
                alt="Logo"
                className="h-12 w-12 object-contain rounded-lg bg-white/70 p-1"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">NIKUTEK</h1>
                <p className="text-sm text-slate-300">Yönetim Paneli</p>
              </div>
            </div>

            <button
              onClick={onToggle}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title="Menüyü Daralt"
            >
              <ChevronLeft size={16} />
            </button>
          </>
        )}

        {isCollapsed && (
          <button
            onClick={onToggle}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            title="Menüyü Genişlet"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>

    {/* Navigation */}
    <div className="flex-1 overflow-y-auto space-y-6 p-4">
      <Section
        title="Ana Menü"
        isCollapsed={isCollapsed}
        items={menuItems}
        onSelect={onSelect}
        isActive={isActive}
        activeColor="blue"
      />
      <Section
        title="İçerik Yönetimi"
        isCollapsed={isCollapsed}
        items={contentItems}
        onSelect={onSelect}
        isActive={isActive}
        activeColor="green"
      />
    </div>
  </>
);

const Section = ({
  title,
  isCollapsed,
  items,
  onSelect,
  isActive,
  activeColor,
}) => (
  <div>
    {!isCollapsed && (
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
        {title}
      </h3>
    )}
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.key}>
            <button
              className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isCollapsed ? "px-2 py-3 justify-center" : "px-3 py-3"
              } ${
                isActive(item.key)
                  ? `bg-${activeColor}-600 text-white shadow-lg shadow-${activeColor}-600/25`
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
              onClick={() => onSelect && onSelect(item.key)}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive(item.key) && <ChevronRight size={16} />}
                </>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  </div>
);

export default Menu;
