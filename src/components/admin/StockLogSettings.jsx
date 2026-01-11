import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  AlertCircle,
  Loader2,
  History,
  ArrowRight,
  Calendar,
  User
} from "lucide-react";

const StockLogSettings = ({ stockId = null }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        // Eğer stockId varsa o ürüne ait logları, yoksa tüm logları getir
        const endpoint = stockId ? `/stocks/${stockId}/logs` : `/stocks/logs`;
        const res = await axiosInstance.get(endpoint);
        setLogs(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Log verileri yüklenirken hata:", error);
        setError("Log verileri yüklenemedi: " + error.message);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [stockId]);

  const getActionIcon = (actionType) => {
    switch (actionType?.toLowerCase()) {
      case 'ekle':
      case 'artır':
      case 'increase':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'çıkar':
      case 'azalt':
      case 'decrease':
        return <Minus className="w-4 h-4 text-red-600" />;
      case 'güncelle':
      case 'update':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      default:
        return <History className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType?.toLowerCase()) {
      case 'ekle':
      case 'artır':
      case 'increase':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'çıkar':
      case 'azalt':
      case 'decrease':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'güncelle':
      case 'update':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatQuantityChange = (oldQty, newQty) => {
    if (oldQty === null || oldQty === undefined) {
      return (
        <span className="text-green-600 font-medium">
          {newQty}
        </span>
      );
    }
    
    const change = newQty - oldQty;
    const isIncrease = change > 0;
    const isDecrease = change < 0;
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-500">{oldQty}</span>
        <ArrowRight className="w-3 h-3 text-gray-400" />
        <span className={`font-medium ${isIncrease ? 'text-green-600' : isDecrease ? 'text-red-600' : 'text-gray-600'}`}>
          {newQty}
        </span>
        {change !== 0 && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            isIncrease 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {isIncrease ? '+' : ''}{change}
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Log verileri yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="text-center py-8">
        <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Bu stok için işlem kaydı bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log, index) => (
        <div key={log.id || index} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getActionColor(log.actionType)}`}>
                {getActionIcon(log.actionType)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {log.actionType || 'Bilinmeyen İşlem'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    #{log.id}
                  </span>
                </div>
                {/* Ürün bilgisi - genel log için */}
                {!stockId && log.stock && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span className="font-medium">{log.stock.productCode}</span> - {log.stock.productName}
                    {log.stock.model && <span className="text-gray-500"> ({log.stock.model})</span>}
                  </div>
                )}
                {log.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {log.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              {new Date(log.actionTime).toLocaleString("tr-TR")}
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Antrepo</span>
              </div>
              {formatQuantityChange(log.oldAntrepoQuantity, log.newAntrepoQuantity)}
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dükkan</span>
              </div>
              {formatQuantityChange(log.oldShopQuantity, log.newShopQuantity)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockLogSettings;
