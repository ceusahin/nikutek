import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Calendar,
  User,
  Activity,
  Database,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterEntity, setFilterEntity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/logs");
      setLogs(res.data);
    } catch (err) {
      console.error("Logs yüklenirken hata:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme ve arama
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = !filterAction || log.action === filterAction;
    const matchesEntity = !filterEntity || log.entity === filterEntity;

    return matchesSearch && matchesAction && matchesEntity;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  // Unique values for filters
  const uniqueActions = [...new Set(logs.map((log) => log.action))];
  const uniqueEntities = [...new Set(logs.map((log) => log.entity))];

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case "create":
      case "ekle":
        return <Activity className="w-4 h-4 text-green-600" />;
      case "update":
      case "güncelle":
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case "delete":
      case "sil":
        return <Activity className="w-4 h-4 text-red-600" />;
      case "login":
      case "giriş":
        return <User className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case "create":
      case "ekle":
        return "bg-green-100 text-green-800";
      case "update":
      case "güncelle":
        return "bg-blue-100 text-blue-800";
      case "delete":
      case "sil":
        return "bg-red-100 text-red-800";
      case "login":
      case "giriş":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Database className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                Admin Logları ( Bakımda )
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Sistem aktivitelerini takip edin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={fetchLogs}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors flex-1 sm:flex-initial text-xs md:text-sm"
            >
              <RefreshCw size={14} className={`md:w-4 md:h-4 ${loading ? "animate-spin" : ""}`} />
              Yenile
            </button>
            <button className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-1 sm:flex-initial text-xs md:text-sm">
              <Download size={14} className="md:w-4 md:h-4" />
              Dışa Aktar
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 md:p-6 border-b border-gray-200 dark:bg-gray-800 dark:text-white bg-gray-50 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Log ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs md:text-sm"
            />
          </div>

          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs md:text-sm"
          >
            <option value="">Tüm Aksiyonlar</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>

          {/* Entity Filter */}
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs md:text-sm"
          >
            <option value="">Tüm Modüller</option>
            {uniqueEntities.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterAction("");
              setFilterEntity("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-xs md:text-sm font-medium"
          >
            Filtreleri Temizle
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto dark:bg-gray-800 dark:text-white">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Loglar yükleniyor...</span>
          </div>
        ) : (
          <div className="min-w-[800px]">
            <table className="w-full dark:bg-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1 md:gap-2">
                    <Calendar size={12} className="md:w-3.5 md:h-3.5" />
                    <span className="hidden sm:inline">Tarih/Saat</span>
                    <span className="sm:hidden">Tarih</span>
                  </div>
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1 md:gap-2">
                    <User size={12} className="md:w-3.5 md:h-3.5" />
                    Admin
                  </div>
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1 md:gap-2">
                    <Activity size={12} className="md:w-3.5 md:h-3.5" />
                    Aksiyon
                  </div>
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  <div className="flex items-center gap-1 md:gap-2">
                    <Database size={12} className="md:w-3.5 md:h-3.5" />
                    Modül
                  </div>
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">
                  <div className="flex items-center gap-1 md:gap-2">
                    <FileText size={12} className="md:w-3.5 md:h-3.5" />
                    Detay
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-1 md:gap-2">
                      <Calendar size={12} className="text-gray-400 hidden sm:block md:w-3.5 md:h-3.5" />
                      <span className="text-xs md:text-sm">
                        {new Date(log.createdAt).toLocaleDateString("tr-TR")}
                        <span className="hidden lg:inline">
                          {" " + new Date(log.createdAt).toLocaleTimeString("tr-TR", {hour: '2-digit', minute: '2-digit'})}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={12} className="text-blue-600 dark:text-blue-400 md:w-3.5 md:h-3.5" />
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[100px] md:max-w-none">
                        {log.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 md:gap-2">
                      {getActionIcon(log.action)}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-900 dark:text-gray-100 hidden lg:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {log.entity}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900 dark:text-gray-100 max-w-[200px] md:max-w-xs truncate hidden xl:table-cell">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredLogs.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
              Toplam <span className="font-medium">{filteredLogs.length}</span>{" "}
              log gösteriliyor
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <ChevronLeft size={14} className="md:w-4 md:h-4" />
              </button>
              <span className="px-3 py-1 text-xs md:text-sm text-gray-700 dark:text-gray-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <ChevronRight size={14} className="md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredLogs.length === 0 && (
        <div className="text-center py-12 px-4">
          <Database className="w-12 h-12 md:w-16 md:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Log bulunamadı
          </h3>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            Arama kriterlerinizi değiştirmeyi deneyin
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;
