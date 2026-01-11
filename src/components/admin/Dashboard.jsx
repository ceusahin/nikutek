import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import MessageList from "./MessageList";
import { usePanel } from "../../contexts/PanelContext";
import {
  Users,
  Eye,
  Calendar,
  TrendingUp,
  Plus,
  Package,
  UserPlus,
  BarChart3,
  Activity,
  Clock,
  MessageSquare,
  FolderOpen,
} from "lucide-react";

const Dashboard = () => {
  const { setActiveContentItem, setActivePage } = usePanel();

  // 📊 Ziyaretçi istatistikleri
  const [todayVisits, setTodayVisits] = useState(0);
  const [weeklyVisits, setWeeklyVisits] = useState(0);
  const [monthlyVisits, setMonthlyVisits] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get("/stats");
        const data = response.data;
        setTodayVisits(data.daily || 0);
        setWeeklyVisits(data.weekly || 0);
        setMonthlyVisits(data.monthly || 0);
        setTotalVisits(data.total || 0);
      } catch (error) {
        console.error("Ziyaretçi istatistikleri alınamadı:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 pt-20 md:pt-24 px-4 md:px-6 lg:pl-10 lg:pr-6 pb-6 transition-all duration-300">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Yönetim paneli ana sayfası
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-slate-800 rounded-lg px-3 md:px-4 py-2 shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  Sistem Aktif
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Site İstatistikleri */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6 flex items-center gap-2">
          <Activity className="w-4 h-4 md:w-5 md:h-5" />
          Site İstatistikleri
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Günlük */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 md:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Bugün
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {todayVisits}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm text-blue-600 dark:text-blue-400">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Günlük ziyaretçi
            </div>
          </div>

          {/* Haftalık */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 md:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Bu Hafta
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {weeklyVisits}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm text-green-600 dark:text-green-400">
              <BarChart3 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Haftalık ziyaretçi
            </div>
          </div>

          {/* Aylık */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 md:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Bu Ay
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {monthlyVisits}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm text-purple-600 dark:text-purple-400">
              Aylık ziyaretçi
            </div>
          </div>

          {/* Toplam */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 md:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Toplam
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {totalVisits}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm text-orange-600 dark:text-orange-400">
              Tüm zamanlar
            </div>
          </div>
        </div>
      </div>

      {/* Hızlı İşlemler */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6 flex items-center gap-2">
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Hızlı İşlemler
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div
            onClick={() => setActiveContentItem("urunler")}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-2 md:mb-3">
                <Plus className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-xs md:text-sm">
                Ürün Ekle
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                Yeni ürün oluştur
              </p>
            </div>
          </div>

          <div
            onClick={() => setActiveContentItem("teknolojiler")}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-2 md:mb-3">
                <Package className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-xs md:text-sm">
                Teknoloji Ekle
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                Yeni teknoloji kaydet
              </p>
            </div>
          </div>

          <div
            onClick={() => setActivePage("stock-yonetimi")}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-2 md:mb-3">
                <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-xs md:text-sm">
                Stok Ekle
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                Yeni stok kaydet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mesajlar & Loglar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Mesajlar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-3 md:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm md:text-base">Son Mesajlar</h3>
                  <p className="text-white/80 text-xs md:text-sm">
                    Gelen mesajlar ve bildirimler
                  </p>
                </div>
              </div>
              <div className="text-white/60 text-xs">Son 3 mesaj</div>
            </div>
          </div>
          <div className="p-4 md:p-6">
            <MessageList />
          </div>
        </div>

        {/* Loglar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm md:text-base">Log Kayıtları</h3>
                <p className="text-white/80 text-xs md:text-sm">Son loglar</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center font-bold italic text-2xl md:text-3xl mt-10">
            Bakımda
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
