import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import SwitchOnOff from "../../utils/SwitchOnOff";
import useLanguage from "../../hooks/useLanguage";
import { showWarning, showConfirm } from "../../utils/toast";
import RichTextEditor from "./RichTextEditor";
import { 
  Plus, 
  Save, 
  Trash2, 
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  Check
} from "lucide-react";

const NEW_KEY = "new"; // null id için key

const ContactInfoSettings = () => {
  const [contactInfos, setContactInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const { language } = useLanguage(); // "tr" veya "en"

  useEffect(() => {
    if (language) fetchContactInfos();
  }, [language]);

  const fetchContactInfos = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/contact-info");
      // console.log(res.data);
      const dataArray = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];
      setContactInfos(dataArray);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslationChange = (infoId, field, value) => {
    setContactInfos((prev) =>
      prev.map((info) => {
        const key = info.id === null ? NEW_KEY : info.id;
        if (key !== (infoId === null ? NEW_KEY : infoId)) return info;

        // Sadece aktif dil için güncelle
        return {
          ...info,
          translations: info.translations.map((t) =>
            t.languageCode === language ? { ...t, [field]: value } : t
          ),
        };
      })
    );
  };

  const handleIsActiveToggle = (infoId) => {
    setContactInfos((prev) =>
      prev.map((info) => {
        const key = info.id === null ? NEW_KEY : info.id;
        if (key !== (infoId === null ? NEW_KEY : infoId)) return info;
        return { ...info, isActive: !info.isActive };
      })
    );
  };

  const handleTypeChange = (infoId, newType) => {
    const exists = contactInfos.some(
      (info) => info.id !== infoId && info.type === newType
    );
    if (exists) {
      showWarning(`${newType} türü zaten seçilmiş! Lütfen farklı bir tür seçin.`);
      return;
    }
    setContactInfos((prev) =>
      prev.map((item) =>
        item.id === infoId || (item.id === null && infoId === null)
          ? { ...item, type: newType }
          : item
      )
    );
  };

  const handleSave = async (info) => {
    try {
      // Backend'e gönderirken languageCode ile çakışmayacak şekilde dto oluştur
      const payload = {
        ...info,
        translations: info.translations.map((t) => ({
          languageCode: t.languageCode || t.language, // eski frontend'den gelen varsa fallback
          title: t.title,
          content: t.content,
        })),
      };

      if (info.id) {
        await axiosInstance.put(`/contact-info/${info.id}`, payload);
      } else {
        await axiosInstance.post(`/contact-info`, payload);
      }
      setMessage("İletişim bilgisi başarıyla kaydedildi!");
      setMessageType("success");
      fetchContactInfos();
    } catch (err) {
      console.error("Save error:", err);
      setMessage("Kaydetme sırasında hata oluştu");
      setMessageType("error");
    }
  };

  const handleDelete = async (info) => {
    if (!info.id) {
      setContactInfos((prev) => prev.filter((item) => item !== info));
      return;
    }
    
    const confirmed = await showConfirm("Bu iletişim bilgisini silmek istediğinize emin misiniz?");
    if (confirmed) {
      try {
        await axiosInstance.delete(`/contact-info/${info.id}`);
        setMessage("İletişim bilgisi başarıyla silindi!");
        setMessageType("success");
        setContactInfos((prev) => prev.filter((item) => item.id !== info.id));
      } catch (error) {
        console.error("Silme hatası:", error);
        setMessage("Silme sırasında hata oluştu.");
        setMessageType("error");
      }
    }
  };

  const handleAddNew = () => {
    const usedTypes = contactInfos.map((info) => info.type);
    const allTypes = ["PHONE", "EMAIL", "ADDRESS", "WORK_HOURS"];
    const availableType = allTypes.find((t) => !usedTypes.includes(t));
    if (!availableType) {
      showWarning("Tüm türler zaten kullanılıyor, yeni bilgi ekleyemezsiniz.");
      return;
    }
    const newInfo = {
      id: null,
      type: availableType,
      isActive: true,
      translations: [
        { languageCode: "tr", title: "", content: "" },
        { languageCode: "en", title: "", content: "" },
      ],
    };
    setContactInfos((prev) => [newInfo, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">İletişim Bilgileri</h3>
              <p className="text-white/80 text-sm">Telefon, email, adres ve çalışma saatleri</p>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            disabled={contactInfos.length >= 4}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Yeni Ekle
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Messages */}
        {message && (
          <div className={`mb-6 rounded-lg p-4 ${
            messageType === "success" 
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" 
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          }`}>
            <div className="flex items-center gap-2">
              {messageType === "success" ? (
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <p className={`${
                messageType === "success" 
                  ? "text-green-700 dark:text-green-300" 
                  : "text-red-700 dark:text-red-300"
              }`}>{message}</p>
            </div>
          </div>
        )}

        {contactInfos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <Phone className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">Henüz iletişim bilgisi yok</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">İlk bilgiyi ekleyin</p>
          </div>
        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contactInfos.map((info) => {
              const key = info.id === null ? NEW_KEY : info.id;
              const currentTrans = info.translations.find(
                (t) => t.languageCode === language
              ) || { title: "", content: "" };

              const getTypeIcon = (type) => {
                switch (type) {
                  case "PHONE": return <Phone className="w-4 h-4" />;
                  case "EMAIL": return <Mail className="w-4 h-4" />;
                  case "ADDRESS": return <MapPin className="w-4 h-4" />;
                  case "WORK_HOURS": return <Clock className="w-4 h-4" />;
                  default: return <Phone className="w-4 h-4" />;
                }
              };

              const getTypeColor = (type) => {
                switch (type) {
                  case "PHONE": return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
                  case "EMAIL": return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
                  case "ADDRESS": return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
                  case "WORK_HOURS": return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
                  default: return "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400";
                }
              };

              return (
                <div
                  key={key}
                  className="bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 transition-colors"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(info.type)}`}>
                          {getTypeIcon(info.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {info.type === "PHONE" ? "Telefon" : 
                             info.type === "EMAIL" ? "Email" :
                             info.type === "ADDRESS" ? "Adres" : "Çalışma Saatleri"}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">İletişim bilgisi</p>
                        </div>
                      </div>
                      <SwitchOnOff
                        checked={info.isActive}
                        onChange={() => handleIsActiveToggle(info.id)}
                      />
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Başlık
                        </label>
                        <textarea
                          value={currentTrans.title}
                          onChange={(e) =>
                            handleTranslationChange(info.id, "title", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none whitespace-pre-line"
                          rows={2}
                          placeholder="Başlık girin..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          İçerik
                        </label>
                        <RichTextEditor
                          value={currentTrans.content || ""}
                          onChange={(value) =>
                            handleTranslationChange(info.id, "content", value)
                          }
                          placeholder="İçerik girin..."
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => handleSave(info)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors"
                      >
                        <Save size={14} />
                        Kaydet
                      </button>
                      <button
                        onClick={() => handleDelete(info)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactInfoSettings;
