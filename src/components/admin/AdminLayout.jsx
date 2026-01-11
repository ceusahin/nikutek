import React, { useState } from "react";
import Menu from "./Menu";
import PanelHeader from "./PanelHeader";
import Dashboard from "./Dashboard";

const AdminLayout = () => {
  const [activePage, setActivePage] = useState("anasayfa");
  const [activeContentItem, setActiveContentItem] = useState(null);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  const handleMenuSelect = (key) => {
    if (key === "anasayfa") {
      setActivePage("anasayfa");
      setActiveContentItem(null);
    } else {
      setActiveContentItem(key);
      setActivePage(null);
    }
  };

  const toggleMenu = () => {
    setIsMenuCollapsed(!isMenuCollapsed);
  };

  // Mock data - gerçek uygulamada API'den gelecek
  const mockData = {
    onlineCount: 42,
    todayOnlineCount: 156,
    monthlyOnlineCount: 2840,
    totalOnlineCount: 15680,
    messages: [],
    projects: []
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Menu 
        onSelect={handleMenuSelect}
        activePage={activePage}
        activeContentItem={activeContentItem}
        isCollapsed={isMenuCollapsed}
        onToggle={toggleMenu}
      />
      <PanelHeader />
      
      {activePage === "anasayfa" && (
        <Dashboard 
          {...mockData}
          isMenuCollapsed={isMenuCollapsed}
        />
      )}
      
      {/* Diğer sayfalar buraya eklenebilir */}
    </div>
  );
};

export default AdminLayout;
