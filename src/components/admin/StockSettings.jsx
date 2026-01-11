import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import StockLogSettings from "./StockLogSettings";
import { showSuccess, showError, showConfirm } from "../../utils/toast";
import { 
  Package, 
  Plus, 
  Trash2, 
  History, 
  Search, 
  Filter,
  AlertCircle,
  CheckCircle,
  Loader2,
  Warehouse,
  Store,
  BarChart3,
  Edit3,
  Save,
  X
} from "lucide-react";

const StockSettings = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [form, setForm] = useState({
    productCode: "",
    productName: "",
    model: "",
    antrepoQuantity: 0,
    shopQuantity: 0,
    note: "",
  });
  const [showLogs, setShowLogs] = useState(false);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/stocks");
      
      // API'den dönen verinin array olup olmadığını kontrol et
      if (Array.isArray(res.data)) {
        setStocks(res.data);
      } else {
        console.error("API'den dönen veri array değil:", res.data);
        setStocks([]);
        setError("API'den beklenmeyen veri formatı döndü");
      }
    } catch (error) {
      console.error("Stok verileri yüklenirken hata:", error);
      setError("Stok verileri yüklenemedi: " + error.message);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const saveStock = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      if (editingStock) {
        await axiosInstance.put(`/stocks/${editingStock.id}`, form);
        setSuccess("Stok başarıyla güncellendi!");
      } else {
        await axiosInstance.post("/stocks", form);
        setSuccess("Stok başarıyla eklendi!");
      }
      
      fetchStocks();
      resetForm();
      setShowForm(false);
      setEditingStock(null);
    } catch (error) {
      console.error("Stok kaydedilirken hata:", error);
      setError("Stok kaydedilemedi: " + error.message);
    }
  };

  const resetForm = () => {
    setForm({
      productCode: "",
      productName: "",
      model: "",
      antrepoQuantity: 0,
      shopQuantity: 0,
      note: "",
    });
  };

  const editStock = (stock) => {
    setEditingStock(stock);
    setForm({
      productCode: stock.productCode,
      productName: stock.productName,
      model: stock.model,
      antrepoQuantity: stock.antrepoQuantity,
      shopQuantity: stock.shopQuantity,
      note: stock.note,
    });
    setShowForm(true);
  };

  const deleteStock = async (id) => {
    const confirmed = await showConfirm("Bu stok kaydını silmek istediğinizden emin misiniz?");
    if (confirmed) {
      try {
        await axiosInstance.delete(`/stocks/${id}`);
        setSuccess("Stok başarıyla silindi!");
        fetchStocks();
      } catch (error) {
        console.error("Stok silinirken hata:", error);
        setError("Stok silinemedi: " + error.message);
      }
    }
  };

  const updateQuantity = async (stockId, type, operation) => {
    try {
      setError(null);
      setSuccess(null);
      
      const stock = stocks.find(s => s.id === stockId);
      if (!stock) return;
      
      const currentQuantity = type === 'antrepo' ? stock.antrepoQuantity : stock.shopQuantity;
      const newQuantity = operation === 'increase' ? currentQuantity + 1 : Math.max(0, currentQuantity - 1);
      
      await axiosInstance.put(`/stocks/${stockId}`, {
        ...stock,
        [type === 'antrepo' ? 'antrepoQuantity' : 'shopQuantity']: newQuantity
      });
      
      setSuccess(`${type === 'antrepo' ? 'Antrepo' : 'Dükkan'} miktarı güncellendi!`);
      fetchStocks();
    } catch (error) {
      console.error("Miktar güncellenirken hata:", error);
      setError("Miktar güncellenemedi: " + error.message);
    }
  };

  const filteredStocks = Array.isArray(stocks) 
    ? stocks.filter(stock => 
        stock.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.model?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="w-full transition-all duration-300 overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2 flex items-center gap-2 md:gap-3">
              <Package className="w-6 h-6 md:w-8 md:h-8 text-blue-600 flex-shrink-0" />
              <span className="truncate">Stok Yönetimi</span>
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 truncate">Nikuni stok takibi ve yönetimi</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="flex-1 sm:flex-initial bg-purple-600 hover:bg-purple-700 text-white px-3 md:px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm md:text-base transition-colors"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">{showLogs ? 'Logları Gizle' : 'Loglar'}</span>
              <span className="sm:hidden">Log</span>
            </button>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingStock(null);
                resetForm();
              }}
              className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm md:text-base transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{showForm ? 'Formu Kapat' : 'Yeni Stok'}</span>
              <span className="sm:hidden">Yeni</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 md:mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-start gap-2 text-sm md:text-base">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" />
          <span className="break-words">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 md:mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-start gap-2 text-sm md:text-base">
          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" />
          <span className="break-words">{success}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="mb-6 md:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Toplam Ürün</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{filteredStocks.length}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Toplam Antrepo</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {filteredStocks.reduce((sum, stock) => sum + (stock.antrepoQuantity || 0), 0)}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Warehouse className="w-5 h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 md:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Toplam Dükkan</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {filteredStocks.reduce((sum, stock) => sum + (stock.shopQuantity || 0), 0)}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Store className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 md:mb-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="truncate">{editingStock ? 'Stok Düzenle' : 'Yeni Stok Ekle'}</span>
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingStock(null);
                resetForm();
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                Ürün Kodu
              </label>
              <input
                type="text"
                placeholder="Ürün kodu girin"
                value={form.productCode}
                onChange={(e) => setForm({ ...form, productCode: e.target.value })}
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                Ürün Adı
              </label>
              <input
                type="text"
                placeholder="Ürün adı girin"
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                Model
              </label>
              <input
                type="text"
                placeholder="Model girin"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                Antrepo Miktarı
              </label>
              <input
                type="number"
                placeholder="0"
                value={form.antrepoQuantity}
                onChange={(e) => setForm({ ...form, antrepoQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                Dükkan Miktarı
              </label>
              <input
                type="number"
                placeholder="0"
                value={form.shopQuantity}
                onChange={(e) => setForm({ ...form, shopQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                Not
              </label>
              <input
                type="text"
                placeholder="Not girin"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 mt-4 md:mt-6">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingStock(null);
                resetForm();
              }}
              className="w-full sm:w-auto px-4 py-2 text-sm md:text-base text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={saveStock}
              className="w-full sm:w-auto px-4 py-2 text-sm md:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              {editingStock ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-4 md:mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="Ürün kodu, adı veya model ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div className="flex items-center justify-end sm:justify-start gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
            <Filter className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">{filteredStocks.length} ürün bulundu</span>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Stok verileri yükleniyor...</p>
        </div>
      )}

      {/* Stock Table */}
      {!loading && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm md:text-base truncate">Stok Listesi</h3>
                <p className="text-white/80 text-xs md:text-sm truncate">Tüm stok kayıtları ve miktarları</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Ürün
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Antrepo
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Dükkan
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Toplam
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Not
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredStocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-3 md:px-6 py-2 md:py-4">
                      <div>
                        <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {stock.productCode}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {stock.productName}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {stock.model}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        <Warehouse className="w-3 h-3 md:w-4 md:h-4 text-orange-500 flex-shrink-0" />
                        <div className="flex items-center gap-0.5 md:gap-1">
                          <button
                            onClick={() => updateQuantity(stock.id, 'antrepo', 'decrease')}
                            className="w-5 h-5 md:w-6 md:h-6 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0"
                            disabled={stock.antrepoQuantity <= 0}
                          >
                            -
                          </button>
                          <span className="text-xs md:text-sm font-medium text-gray-900 dark:text-white min-w-[1.5rem] md:min-w-[2rem] text-center">
                            {stock.antrepoQuantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(stock.id, 'antrepo', 'increase')}
                            className="w-5 h-5 md:w-6 md:h-6 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        <Store className="w-3 h-3 md:w-4 md:h-4 text-green-500 flex-shrink-0" />
                        <div className="flex items-center gap-0.5 md:gap-1">
                          <button
                            onClick={() => updateQuantity(stock.id, 'shop', 'decrease')}
                            className="w-5 h-5 md:w-6 md:h-6 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0"
                            disabled={stock.shopQuantity <= 0}
                          >
                            -
                          </button>
                          <span className="text-xs md:text-sm font-medium text-gray-900 dark:text-white min-w-[1.5rem] md:min-w-[2rem] text-center">
                            {stock.shopQuantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(stock.id, 'shop', 'increase')}
                            className="w-5 h-5 md:w-6 md:h-6 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        <Package className="w-3 h-3 md:w-4 md:h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          {(stock.antrepoQuantity || 0) + (stock.shopQuantity || 0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {stock.note || '-'}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => editStock(stock)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          title="Düzenle"
                        >
                          <Edit3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => deleteStock(stock.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStocks.length === 0 && !loading && (
            <div className="text-center py-8 md:py-12 px-4">
              <Package className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Arama kriterlerinize uygun stok bulunamadı.' : 'Henüz stok kaydı bulunmuyor.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* General Stock Logs */}
      {showLogs && (
        <div className="mt-6 md:mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 p-3 md:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <History className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm md:text-base truncate">Genel Stok Logları</h3>
                  <p className="text-white/80 text-xs md:text-sm truncate">Tüm stok değişiklikleri ve işlem kayıtları</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogs(false)}
                className="text-white/60 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-4 md:p-6">
            <StockLogSettings />
          </div>
        </div>
      )}
    </div>
  );
};

export default StockSettings;
