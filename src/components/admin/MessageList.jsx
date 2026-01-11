import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import { MessageSquare, Clock, User, Mail } from "lucide-react";

const MessageList = ({ messages }) => {
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Son 3 mesajı getir
  const fetchRecentMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/contact/messages");
      // En yeni 3 mesajı al (tarihe göre azalan sırada)
      const sortedMessages = response.data
        .sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0))
        .slice(0, 3);
      setRecentMessages(sortedMessages);
    } catch (error) {
      console.error("Son mesajlar alınırken hata:", error);
      setRecentMessages(messages.slice(0, 3));
    } finally {
      setLoading(false);
    }
  }, [messages]);

  useEffect(() => {
    fetchRecentMessages();
  }, [fetchRecentMessages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400 text-sm">Mesajlar yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (recentMessages.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageSquare className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Henüz mesaj yok</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentMessages.map((msg, index) => (
        <div
          key={msg.id || index}
          className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {msg.name}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(msg.created_at || msg.createdAt || Date.now()).toLocaleString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {msg.email}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {msg.message}
              </p>
              {msg.subject && (
                <div className="mt-2">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                    {msg.subject}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
