import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Trash2, Eye, X, RefreshCw } from "lucide-react";
import { showSuccess, showError, showConfirm } from "../../utils/toast";

const MessagesSettings = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mesajları getir
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/contact/messages");
      // En yeni mesajlar üstte olacak şekilde sırala
      const sortedMessages = response.data.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));
      setMessages(sortedMessages);
    } catch (error) {
      console.error("Mesajlar alınırken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Mesaj sil
  const handleDelete = async (id) => {
    const confirmed = await showConfirm("Bu mesajı silmek istediğinize emin misiniz?");
    if (!confirmed) return;
    
    try {
      await axiosInstance.delete(`/contact/messages/${id}`);
      setMessages(messages.filter((msg) => msg.id !== id));
      setSelectedMessage(null); // Modal'ı kapat
      showSuccess("Mesaj başarıyla silindi!");
    } catch (error) {
      console.error("Mesaj silme hatası:", error);
      showError("Mesaj silinirken bir hata oluştu!");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 w-full mx-auto overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-lg flex items-center justify-center text-base md:text-lg flex-shrink-0">
              📧
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white truncate">İletişim Mesajları</h2>
              <p className="text-blue-100 mt-0.5 md:mt-1 text-xs md:text-sm truncate">Gelen mesajları görüntüleyin ve yönetin</p>
            </div>
          </div>
          <button 
            onClick={fetchMessages} 
            className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white px-3 md:px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base font-medium"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8 bg-white dark:bg-gray-900 min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 dark:text-gray-400">Mesajlar yükleniyor...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 min-h-[400px] flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Henüz mesaj yok</h3>
            <p className="text-gray-500 dark:text-gray-400">İletişim formundan gelen mesajlar burada görünecek</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-2 md:gap-3 mb-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs md:text-sm">
                          {msg.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 dark:text-white text-sm md:text-base truncate">{msg.name}</h3>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">{msg.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Telefon</span>
                        <p className="text-xs md:text-sm text-gray-800 dark:text-gray-200 truncate">{msg.phone || "-"}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Konu</span>
                        <p className="text-xs md:text-sm text-gray-800 dark:text-gray-200 font-medium truncate">{msg.subject}</p>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tarih & Saat</span>
                        <p className="text-xs md:text-sm text-gray-800 dark:text-gray-200">
                          {new Date(msg.created_at || msg.createdAt || Date.now()).toLocaleString('tr-TR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedMessage(msg)}
                      className="flex-1 sm:flex-initial p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                      title="Mesajı Görüntüle"
                    >
                      <Eye className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="flex-1 sm:flex-initial p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                      title="Mesajı Sil"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modern Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base md:text-lg lg:text-xl font-bold text-white truncate">Mesaj Detayı</h2>
                    <p className="text-blue-100 text-xs md:text-sm truncate">Gönderen: {selectedMessage.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-1.5 md:p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ad Soyad</label>
                    <p className="text-sm md:text-base text-gray-900 dark:text-white font-medium break-words">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">E-posta</label>
                    <p className="text-sm md:text-base text-gray-900 dark:text-white break-all">{selectedMessage.email}</p>
                  </div>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Telefon</label>
                    <p className="text-sm md:text-base text-gray-900 dark:text-white">{selectedMessage.phone || "-"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Konu</label>
                    <p className="text-sm md:text-base text-gray-900 dark:text-white font-medium break-words">{selectedMessage.subject}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Gönderim Tarihi</label>
                    <p className="text-xs md:text-sm text-gray-900 dark:text-white">
                      {new Date(selectedMessage.created_at || selectedMessage.createdAt || Date.now()).toLocaleString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        weekday: 'long'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 md:mb-3 block">Mesaj İçeriği</label>
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg md:rounded-xl p-3 md:p-4 min-h-[120px]">
                  <p className="text-sm md:text-base text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap break-words">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 dark:bg-gray-800 px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="w-full sm:w-auto px-3 md:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm md:text-base font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Mesajı Sil
                </button>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="w-full sm:w-auto px-3 md:px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm md:text-base font-medium transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesSettings;
