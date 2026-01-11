import React, { useCallback, useEffect, useState } from "react";
import useLanguage from "../../hooks/useLanguage";
import axiosInstance from "../../api/axiosInstance";
import {showConfirm } from "../../utils/toast";

const FooterSettings = () => {
  const { language } = useLanguage();

  const [menus, setMenus] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  const [showNewMenuInput, setShowNewMenuInput] = useState(false);
  const [newMenuTitle, setNewMenuTitle] = useState("");

  const [newItem, setNewItem] = useState({ name: "", url: "" });
  const [message, setMessage] = useState("");

  const loadMenuItems = async (menuId) => {
    try {
      const res = await axiosInstance.get(
        `/footer-menu-item/by-menu/${menuId}`
      );
      setMenuItems(res.data);
      setMessage("");
    } catch {
      setMenuItems([]);
      setMessage("Menü öğeleri yüklenirken hata oluştu.");
    }
  };

  const loadMenus = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/footer-menu/${language}`);
      setMenus(res.data);
      setSelectedMenuId(null);
      setMenuItems([]);
      setMessage("");
    } catch {
      setMessage("Menüler yüklenirken hata oluştu.");
    }
  }, [language]);

  useEffect(() => {
    if (language) loadMenus();
  }, [language, loadMenus]);

  const addMenu = async () => {
    if (!newMenuTitle.trim()) {
      setMessage("Lütfen menü başlığı girin.");
      return;
    }
    try {
      await axiosInstance.post(`/footer-menu?languageCode=${language}`, {
        title: newMenuTitle.trim(),
      });
      setNewMenuTitle("");
      setShowNewMenuInput(false);
      loadMenus();
      setMessage("Menü başarıyla eklendi.");
    } catch {
      setMessage("Menü eklenirken hata oluştu.");
    }
  };

  const deleteMenu = async (menuId) => {
    const confirmed = await showConfirm("Bu menüyü silmek istediğinizden emin misiniz?");
    if (!confirmed) return;
    try {
      await axiosInstance.delete(`/footer-menu/${menuId}`);
      if (menuId === selectedMenuId) {
        setSelectedMenuId(null);
        setMenuItems([]);
      }
      loadMenus();
      setMessage("Menü silindi.");
    } catch {
      setMessage("Menü silinirken hata oluştu.");
    }
  };

  const addItem = async () => {
    if (!newItem.name.trim() || !newItem.url.trim()) {
      setMessage("Öğe adı ve URL boş bırakılamaz.");
      return;
    }
    try {
      await axiosInstance.post(`/footer-menu-item/${selectedMenuId}`, {
        name: newItem.name.trim(),
        url: newItem.url.trim(),
      });
      setNewItem({ name: "", url: "" });
      loadMenuItems(selectedMenuId);
      setMessage("Öğe başarıyla eklendi.");
    } catch {
      setMessage("Öğe eklenirken hata oluştu.");
    }
  };

  const deleteItem = async (itemId) => {
    const confirmed = await showConfirm("Bu öğeyi silmek istediğinizden emin misiniz?");
    if (!confirmed) return;
    try {
      await axiosInstance.delete(`/footer-menu-item/${itemId}`);
      loadMenuItems(selectedMenuId);
      setMessage("Öğe silindi.");
    } catch {
      setMessage("Öğe silinirken hata oluştu.");
    }
  };

  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-lg flex items-center justify-center text-base md:text-lg">
            📋
          </div>
          <span className="truncate">Footer Menü Yönetimi</span>
        </h2>
        <p className="text-red-100 mt-1 md:mt-2 text-xs md:text-sm">
          Footer menülerinizi düzenleyin ve yönetin
        </p>
      </div>

      <div className="p-4 md:p-6 lg:p-8">
        {/* Bildirim Alanı */}
        {message && (
          <div
            className={`mb-4 md:mb-6 p-3 md:p-4 rounded-lg md:rounded-xl flex items-center gap-2 md:gap-3 text-sm md:text-base ${
              message.includes("başarıyla") ||
              message.includes("eklendi") ||
              message.includes("silindi")
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
            }`}
          >
            <span className="font-medium break-words">{message}</span>
          </div>
        )}

        {/* Menü Ekleme Alanı */}
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 md:gap-4">
          <button
            onClick={() => setShowNewMenuInput((v) => !v)}
            className={`px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto ${
              showNewMenuInput
                ? "bg-gray-500 hover:bg-gray-600 text-white"
                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            {showNewMenuInput ? "İptal" : "Menü Ekle"}
          </button>

          {showNewMenuInput && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Yeni Menü Başlığı"
                className="px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:outline-none w-full sm:flex-1"
                value={newMenuTitle}
                onChange={(e) => setNewMenuTitle(e.target.value)}
              />
              <button
                onClick={addMenu}
                className="bg-green-500 hover:bg-green-600 text-white px-4 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold"
              >
                Kaydet
              </button>
            </div>
          )}
        </div>

        {/* Menü Butonları */}
        <div className="flex gap-2 md:gap-4 overflow-x-auto pb-3 md:pb-4 border-b border-gray-300 dark:border-gray-600 mb-6 md:mb-8 scrollbar-thin">
          {menus.map((menu) => (
            <div
              key={menu.id}
              onClick={() => {
                setSelectedMenuId(menu.id);
                loadMenuItems(menu.id);
              }}
              className={`cursor-pointer p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-all duration-200 flex justify-between items-center group flex-shrink-0 min-w-[180px] ${
                menu.id === selectedMenuId
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 shadow-lg"
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-red-300 dark:hover:border-red-500 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-2 md:gap-3 w-full">
                <div
                  className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0 ${
                    menu.id === selectedMenuId
                      ? "bg-red-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                ></div>

                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-medium text-sm md:text-base truncate">{menu.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMenu(menu.id);
                    }}
                    className="text-red-400 hover:text-red-600 dark:text-red-300 dark:hover:text-red-100 transition-all duration-200 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                    title="Menüyü Sil"
                  >
                    <svg
                      className="w-3.5 h-3.5 md:w-4 md:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Seçilen Menü İçeriği */}
        {selectedMenuId && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl md:rounded-2xl p-4 md:p-6 relative">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                Menü Öğeleri
              </h3>
              <button
                onClick={() => {
                  setSelectedMenuId(null);
                  setMenuItems([]);
                }}
                className="text-gray-500 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-all duration-200 p-1.5 md:p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Kapat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 md:w-5 md:h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {menuItems.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 mb-4 md:mb-6 text-sm md:text-base">
                Bu menüye ait öğe bulunmamaktadır.
              </p>
            ) : (
              <div className="space-y-2 md:space-y-3 max-h-60 md:max-h-80 overflow-auto mb-4 md:mb-6">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm md:text-base truncate">
                        {item.name}
                      </p>
                      <p className="text-xs md:text-sm text-blue-600 dark:text-blue-400 break-all">
                        {item.url}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-md md:rounded-lg text-xs md:text-sm font-semibold w-full sm:w-auto"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Yeni Öğeyi Ekleme Alanı */}
            <div className="flex flex-col gap-2 md:gap-3">
              <input
                type="text"
                placeholder="Öğe Adı"
                className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <input
                type="text"
                placeholder="URL"
                className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                value={newItem.url}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, url: e.target.value }))
                }
              />
              <button
                onClick={addItem}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold shadow-md"
              >
                Öğeyi Ekle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FooterSettings;
