import React, { useEffect, useState } from "react";
import useLanguage from "../../hooks/useLanguage";
import axiosInstance from "../../api/axiosInstance";
import { showWarning } from "../../utils/toast";
import RichTextEditor from "./RichTextEditor";
import { 
  Save, 
  Upload, 
  Trash2, 
  Image as ImageIcon,
  Type,
  FileText,
  Link,
  AlertCircle,
  Check
} from "lucide-react";

const MainHeroSettings = () => {
  const { language } = useLanguage(); // tr / en

  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // console.log("Updated Hero:", hero);
  }, [hero]);

  useEffect(() => {
    if (!language) return;
    fetchHero(language);
  }, [language]);

  const fetchHero = async (lang) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/main-hero/${lang}`);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setHero(
        data || {
          header: "",
          paragraph: "",
          button1Text: "",
          button1Url: "",
          button2Text: "",
          button2Url: "",
          imageUrl: "",
        }
      );
      setMessage("");
      setMessageType("success");
    } catch (err) {
      console.error(err);
      setMessage("Hero verileri yüklenirken hata oluştu.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setHero((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const removeImage = async () => {
    if (!hero.id) return;

    try {
      setLoading(true);
      await axiosInstance.delete(`/main-hero/${hero.id}`);
      setHero((prev) => ({ ...prev, imageUrl: "" }));
      setSelectedFile(null);
      setMessage("Resim başarıyla silindi.");
      setMessageType("success");
    } catch (err) {
      console.error(err);
      setMessage("Resim silinirken hata oluştu.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const saveOrUpdateHero = async () => {
    if (!hero.header?.trim()) {
      showWarning("Başlık alanını doldurun.");
      return;
    }

    const formData = new FormData();
    formData.append("id", hero.id || "");
    formData.append("header", hero.header || "");
    formData.append("paragraph", hero.paragraph || "");
    formData.append("button1Text", hero.button1Text || "");
    formData.append("button1Url", hero.button1Url || "");
    formData.append("button2Text", hero.button2Text || "");
    formData.append("button2Url", hero.button2Url || "");
    formData.append("languageCode", language);
    if (selectedFile) formData.append("image", selectedFile);

    setLoading(true);
    try {
      const res = await axiosInstance.post("/main-hero", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setHero(data);
      setSelectedFile(null);
      setMessage("Hero başarıyla kaydedildi.");
      setMessageType("success");
    } catch (err) {
      console.error(err);
      setMessage("Hero kaydedilirken hata oluştu.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (!hero) {
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Type className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Ana Sayfa Hero Bölümü</h3>
            <p className="text-white/80 text-sm">Ana sayfa başlık ve buton ayarları</p>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol taraf: Metin alanları */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Type className="w-4 h-4 inline mr-2" />
                Ana Başlık
              </label>
              <input
                type="text"
                value={hero.header || ""}
                onChange={(e) => updateField("header", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                disabled={loading}
                placeholder="Ana başlığı girin..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Açıklama Metni
              </label>
              <RichTextEditor
                value={hero.paragraph || ""}
                onChange={(value) => updateField("paragraph", value)}
                placeholder="Açıklama metnini girin..."
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Link className="w-4 h-4 inline mr-2" />
                  Buton 1 Metni
                </label>
                <input
                  type="text"
                  value={hero.button1Text || ""}
                  onChange={(e) => updateField("button1Text", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  disabled={loading}
                  placeholder="Buton metni..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Link className="w-4 h-4 inline mr-2" />
                  Buton 1 URL
                </label>
                <input
                  type="url"
                  value={hero.button1Url || ""}
                  onChange={(e) => updateField("button1Url", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  disabled={loading}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Link className="w-4 h-4 inline mr-2" />
                  Buton 2 Metni
                </label>
                <input
                  type="text"
                  value={hero.button2Text || ""}
                  onChange={(e) => updateField("button2Text", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  disabled={loading}
                  placeholder="Buton metni..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Link className="w-4 h-4 inline mr-2" />
                  Buton 2 URL
                </label>
                <input
                  type="url"
                  value={hero.button2Url || ""}
                  onChange={(e) => updateField("button2Url", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  disabled={loading}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Sağ taraf: Resim alanı */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <ImageIcon className="w-4 h-4 inline mr-2" />
                Hero Resmi
              </label>

              {hero.imageUrl ? (
                <div className="relative">
                  <img
                    src={hero.imageUrl}
                    alt="Hero"
                    className="w-full h-auto rounded-lg border border-gray-200 dark:border-slate-600"
                  />
                  <button
                    onClick={removeImage}
                    disabled={loading}
                    className="absolute top-3 right-3 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    title="Resmi Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-slate-700/50">
                  <input
                    type="file"
                    id="heroImage"
                    onChange={handleFileChange}
                    disabled={loading}
                    accept="image/*"
                    className="hidden"
                  />
                  <label
                    htmlFor="heroImage"
                    className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Upload size={16} />
                    Resim Seç
                  </label>
                  {selectedFile && (
                    <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Seçilen dosya:</span> {selectedFile.name}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
          <div className="flex justify-end">
            <button
              onClick={saveOrUpdateHero}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Kaydet / Güncelle
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainHeroSettings;
