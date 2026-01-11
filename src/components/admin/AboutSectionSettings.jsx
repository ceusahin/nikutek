import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";
import { showConfirm } from "../../utils/toast";
import RichTextEditor from "./RichTextEditor";
import {
  Plus,
  Trash2,
  Save,
  Edit3,
  Image as ImageIcon,
  FileText,
  Video,
  Upload,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

const AboutUsSettings = () => {
  const [aboutUsList, setAboutUsList] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    paragraph: "",
    smallTitle1: "",
    smallText1: "",
    smallTitle2: "",
    smallText2: "",
    smallTitle3: "",
    smallText3: "",
    mediaUrl: "",
    youtubeVideoUrl: "",
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const { language } = useLanguage();

  const fetchAboutUs = async (langCode) => {
    if (!langCode) return;
    try {
      const res = await axiosInstance.get(`/about-us/${langCode}`);
      // console.log(res.data);
      setAboutUsList(res.data);
    } catch (err) {
      console.error(err);
      setError("İçerik çekme hatası");
    }
  };

  useEffect(() => {
    // console.log("Seçilen dil değişti:", language);
    fetchAboutUs(language);
  }, [language]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!language) {
      setError("Dil seçmelisiniz");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const data = new FormData();
    if (file) {
      data.append("file", file);
    }
    data.append(
      "data",
      new Blob(
        [
          JSON.stringify({
            ...formData,
            language: { code: language },
          }),
        ],
        { type: "application/json" }
      )
    );

    try {
      await axiosInstance.post("/about-us", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData({
        id: null,
        title: "",
        paragraph: "",
        smallTitle1: "",
        smallText1: "",
        smallTitle2: "",
        smallText2: "",
        smallTitle3: "",
        smallText3: "",
        mediaUrl: "",
        youtubeVideoUrl: "",
      });
      setFile(null);
      fetchAboutUs(language);
      setSuccess(
        formData.id
          ? "İçerik başarıyla güncellendi!"
          : "İçerik başarıyla eklendi!"
      );
    } catch (err) {
      console.error(err);
      setError("Kaydetme hatası");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      title: item.title,
      paragraph: item.paragraph,
      smallTitle1: item.smallTitle1,
      smallText1: item.smallText1,
      smallTitle2: item.smallTitle2,
      smallText2: item.smallText2,
      smallTitle3: item.smallTitle3,
      smallText3: item.smallText3,
      mediaUrl: item.mediaUrl,
      youtubeVideoUrl: item.youtubeVideoUrl,
    });
    setFile(null);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("Bu içeriği silmek istediğinize emin misiniz?");
    if (!confirmed) return;
    setLoading(true);
    setError("");
    try {
      await axiosInstance.delete(`/about-us/${id}`);
      fetchAboutUs(language);
      setSuccess("İçerik başarıyla silindi!");
    } catch (err) {
      console.error(err);
      setError("Silme hatası");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: "",
      paragraph: "",
      smallTitle1: "",
      smallText1: "",
      smallTitle2: "",
      smallText2: "",
      smallTitle3: "",
      smallText3: "",
      mediaUrl: "",
      youtubeVideoUrl: "",
    });
    setFile(null);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Hakkımızda Yönetimi
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Hakkımızda sayfası içeriklerini yönetin
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg px-3 md:px-4 py-2 shadow-sm border border-gray-200 dark:border-slate-700">
            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              Toplam İçerik:
            </span>
            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
              {aboutUsList.length}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 md:mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-xs md:text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 md:mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-xs md:text-sm text-green-700 dark:text-green-300">{success}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Sol Panel - İçerik Listesi */}
        <div className="xl:col-span-1 col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-sm md:text-base truncate">İçerik Listesi</h3>
                  <p className="text-white/80 text-xs md:text-sm truncate">
                    Mevcut hakkımızda içerikleri
                  </p>
                </div>
              </div>
            </div>

            {/* Content List */}
            <div className="p-3 md:p-6 max-h-[400px] xl:max-h-[calc(100vh-400px)] overflow-y-auto">
              {aboutUsList.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Henüz içerik eklenmemiş
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    İlk içeriği ekleyin
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aboutUsList.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 transition-colors"
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Image */}
                          <div className="flex-shrink-0">
                            {item.mediaUrl ? (
                              <img
                                src={item.mediaUrl}
                                alt="Content preview"
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-slate-600"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">
                              {item.title || "Başlıksız İçerik"}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                              {item.paragraph || "Açıklama yok"}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {item.smallTitle1 && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                                  {item.smallTitle1}
                                </span>
                              )}
                              {item.smallTitle2 && (
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                                  {item.smallTitle2}
                                </span>
                              )}
                              {item.smallTitle3 && (
                                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full">
                                  {item.smallTitle3}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Panel - Form */}
        <div className="xl:col-span-1 col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-700 dark:to-orange-800 p-3 md:p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm md:text-base truncate">
                      {formData.id ? "İçerik Düzenle" : "Yeni İçerik"}
                    </h3>
                    <p className="text-white/80 text-xs md:text-sm truncate">
                      {formData.id
                        ? "Mevcut içeriği düzenleyin"
                        : "Yeni içerik ekleyin"}
                    </p>
                  </div>
                </div>
                {formData.id && (
                  <button
                    onClick={resetForm}
                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex-shrink-0"
                    title="Formu Temizle"
                  >
                    <X size={14} className="md:w-4 md:h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-3 md:p-6 max-h-[600px] xl:max-h-[calc(100vh-300px)] overflow-y-auto">
              <div className="space-y-4 md:space-y-6">
                {/* Ana Başlık */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ana Başlık
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Ana başlığı girin..."
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Ana Paragraf */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ana Açıklama
                  </label>
                  <RichTextEditor
                    value={formData.paragraph || ""}
                    onChange={(value) => handleChange({ target: { name: "paragraph", value } })}
                    placeholder="Ana açıklamayı girin..."
                  />
                </div>

                {/* Alt Başlık 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alt Başlık 1
                  </label>
                  <input
                    type="text"
                    name="smallTitle1"
                    placeholder="Alt başlık 1'i girin..."
                    value={formData.smallTitle1}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Alt Metin 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alt Metin 1
                  </label>
                  <RichTextEditor
                    value={formData.smallText1 || ""}
                    onChange={(value) => handleChange({ target: { name: "smallText1", value } })}
                    placeholder="Alt metin 1'i girin..."
                  />
                </div>

                {/* Alt Başlık 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alt Başlık 2
                  </label>
                  <input
                    type="text"
                    name="smallTitle2"
                    placeholder="Alt başlık 2'yi girin..."
                    value={formData.smallTitle2}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Alt Metin 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alt Metin 2
                  </label>
                  <RichTextEditor
                    value={formData.smallText2 || ""}
                    onChange={(value) => handleChange({ target: { name: "smallText2", value } })}
                    placeholder="Alt metin 2'yi girin..."
                  />
                </div>

                {/* Alt Başlık 3 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alt Başlık 3
                  </label>
                  <input
                    type="text"
                    name="smallTitle3"
                    placeholder="Alt başlık 3'ü girin..."
                    value={formData.smallTitle3}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Alt Metin 3 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alt Metin 3
                  </label>
                  <RichTextEditor
                    value={formData.smallText3 || ""}
                    onChange={(value) => handleChange({ target: { name: "smallText3", value } })}
                    placeholder="Alt metin 3'ü girin..."
                  />
                </div>

                {/* Resim Yükleme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <ImageIcon className="w-4 h-4 inline mr-2" />
                    Resim Yükle
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center bg-gray-50 dark:bg-slate-700/50">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Upload size={16} />
                      Resim Seç
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {file && (
                      <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Seçilen dosya:</span>{" "}
                          {file.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-gray-50 dark:bg-slate-700/50 px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetForm}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-lg transition-colors"
                >
                  <X size={16} />
                  Temizle
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || (!formData.title && !formData.paragraph)}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {formData.id ? "Güncelle" : "Kaydet"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsSettings;
