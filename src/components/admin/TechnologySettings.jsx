import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";
import { showSuccess, showError, showConfirm } from "../../utils/toast";
import RichTextEditor from "./RichTextEditor";
import {
  Plus,
  Save,
  Trash2,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Globe,
  Image as ImageIcon,
  File,
  Edit3,
  Eye,
  EyeOff,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

const TechnologySettings = () => {
  const { language } = useLanguage(); // 'tr' veya 'en'
  const [technologies, setTechnologies] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    imageUrl: "",
    textContent: "",
    active: true,
    translations: {},
    catalogs: [],
  });
  const [contentType, setContentType] = useState("image"); // "image" veya "text"
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCatalog, setUploadingCatalog] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [deletingCatalogIndex, setDeletingCatalogIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [languages, setLanguages] = useState([]);

  const fetchTechnologies = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/technologies");
      // displayOrder veya order'a göre sırala
      const sorted = res.data.sort((a, b) => {
        const orderA = a.displayOrder ?? a.order ?? a.id ?? 0;
        const orderB = b.displayOrder ?? b.order ?? b.id ?? 0;
        return orderA - orderB;
      });
      setTechnologies(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (techId, direction) => {
    try {
      const currentIndex = filteredTechnologies.findIndex((t) => t.id === techId);
      if (currentIndex === -1) return;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= filteredTechnologies.length) return;

      const updatedTechnologies = [...filteredTechnologies];
      [updatedTechnologies[currentIndex], updatedTechnologies[newIndex]] = [
        updatedTechnologies[newIndex],
        updatedTechnologies[currentIndex],
      ];

      // Backend'e sıralama güncellemesi gönder
      const reorderData = updatedTechnologies.map((tech, index) => ({
        id: tech.id,
        displayOrder: index + 1,
      }));

      await axiosInstance.put("/technologies/reorder", { items: reorderData });
      await fetchTechnologies();
      showSuccess("Sıralama güncellendi!");
    } catch (err) {
      console.error("Sıralama güncelleme hatası:", err);
    }
  };

  useEffect(() => {
    fetchTechnologies();
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const res = await axiosInstance.get("/languages");
      setLanguages(res.data);
    } catch (e) {
      console.error("Diller yüklenirken hata:", e);
    }
  };

  // Dinamik form oluşturma
  const createEmptyFormData = () => {
    const translations = {};
    languages.forEach((lang) => {
      translations[lang.code] = { 
        title: "", 
        description: "", 
        featuresDescription: "", 
        slug: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
        seoOgTitle: "",
        seoOgDescription: "",
        seoOgImage: "",
      };
    });

    return {
      id: null,
      imageUrl: "",
      textContent: "",
      active: true,
      translations,
      catalogs: [],
    };
  };

  // Mevcut teknoloji verilerini formata çevirme
  const formatTechnologyForForm = (tech) => {
    const translations = {};
    languages.forEach((lang) => {
      const existingTranslation = tech.translations?.find(
        (t) => t.langCode === lang.code
      );
      translations[lang.code] = {
        title: existingTranslation?.title || "",
        description: existingTranslation?.description || "",
        featuresDescription: existingTranslation?.featuresDescription || "",
        slug: existingTranslation?.slug || "",
        seoTitle: existingTranslation?.seoTitle || "",
        seoDescription: existingTranslation?.seoDescription || "",
        seoKeywords: existingTranslation?.seoKeywords || "",
        seoOgTitle: existingTranslation?.seoOgTitle || "",
        seoOgDescription: existingTranslation?.seoOgDescription || "",
        seoOgImage: existingTranslation?.seoOgImage || "",
      };
    });

    return {
      id: tech.id,
      imageUrl: tech.imageUrl || "",
      textContent: tech.textContent || "",
      active: tech.active,
      translations,
      catalogs: (tech.catalogs || []).map(cat => ({
        id: cat.id,
        name: cat.name || "",
        fileUrl: cat.fileUrl || cat.file_url || cat.url || "",
      })),
    };
  };

  const handleFileUpload = async (e, type = "image") => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Dosya boyutu kontrolü (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert(`Dosya boyutu çok büyük! Maksimum dosya boyutu: 50MB. Seçilen dosya: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    if (type === "image") {
      setUploading(true);
    } else {
      setUploadingCatalog(true);
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axiosInstance.post("/technologies/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000, // 5 dakika timeout (büyük dosyalar için)
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Yükleme ilerlemesi: ${percentCompleted}%`);
          }
        },
      });

      if (type === "image") {
        setFormData((prev) => ({ ...prev, imageUrl: res.data }));
      } else {
        setFormData((prev) => ({
          ...prev,
          catalogs: [...prev.catalogs, { name: file.name, fileUrl: res.data }],
        }));
      }
    } catch (e) {
      console.error("Yükleme hatası detayları:", {
        message: e.message,
        code: e.code,
        status: e.response?.status,
        statusText: e.response?.statusText,
        data: e.response?.data,
      });
      
      if (e.code === "ECONNABORTED" || e.message.includes("timeout")) {
        alert("Dosya yükleme zaman aşımına uğradı. Lütfen daha küçük bir dosya deneyin veya tekrar deneyin.");
      } else if (e.code === "ERR_NETWORK" || e.response?.status === 0) {
        alert("Ağ hatası oluştu. İnternet bağlantınızı kontrol edin ve tekrar deneyin. Sunucuya bağlanılamıyor olabilir.");
      } else if (e.response?.status === 500) {
        const errorMsg = e.response?.data?.message || e.response?.data?.error || "Sunucu hatası";
        alert(`Sunucu hatası (500): ${errorMsg}. Dosya boyutu çok büyük olabilir veya sunucu geçici olarak kullanılamıyor. Lütfen daha küçük bir dosya deneyin veya daha sonra tekrar deneyin.`);
      } else if (e.response?.status === 413) {
        alert("Dosya boyutu çok büyük! Lütfen daha küçük bir dosya seçin.");
      } else if (e.response?.status >= 400 && e.response?.status < 500) {
        alert(`İstek hatası (${e.response?.status}): ${e.response?.data?.message || e.message}`);
      } else {
        alert(`Dosya yüklenirken hata oluştu: ${e.response?.data?.message || e.response?.data?.error || e.message || "Bilinmeyen hata"}`);
      }
    } finally {
      if (type === "image") {
        setUploading(false);
      } else {
        setUploadingCatalog(false);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, active, imageUrl, textContent } = formData;
      
      // Eğer id varsa, mevcut teknoloji güncelleniyor
      // Eğer id yoksa, yeni teknoloji oluşturuluyor
      const techId = id; // Önce mevcut ID'yi al
      
      // 1️⃣ Ana technology kaydı
      // contentType'a göre imageUrl veya textContent gönder
      // Seçili olmayan alanı temizle
      const techRes = await axiosInstance.post("/technologies", {
        id: id || null,
        active,
        imageUrl: contentType === "image" ? imageUrl : "",
        textContent: contentType === "text" ? textContent : "",
      });
      
      // Save işleminden sonra formData'yı güncelle (seçili olmayan alanı temizle)
      if (contentType === "image") {
        setFormData((prev) => ({ ...prev, textContent: "" }));
      } else {
        setFormData((prev) => ({ ...prev, imageUrl: "" }));
      }

      // Backend'den dönen ID'yi kontrol et
      // Yeni oluşturulduysa backend'den ID gelir, güncelleniyorsa aynı ID döner
      const finalTechId = techRes.data?.id ?? techId;
      
      if (!finalTechId) {
        console.error("Tech response:", techRes.data);
        throw new Error("Teknoloji kaydedilemedi: ID alınamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
      }

      // 2️⃣ Tüm dillerdeki çevirileri kaydet
      for (const lang of languages) {
        const t = formData.translations[lang.code];
        if (t && (t.title || t.description || t.featuresDescription)) {
          try {
            await axiosInstance.post("/technologies/translation", {
              technologyId: finalTechId,
              langCode: lang.code,
              title: t.title || "",
              description: t.description || "",
              featuresDescription: t.featuresDescription || "",
              slug: t.slug || "",
              seoTitle: t.seoTitle || "",
              seoDescription: t.seoDescription || "",
              seoKeywords: t.seoKeywords || "",
              seoOgTitle: t.seoOgTitle || "",
              seoOgDescription: t.seoOgDescription || "",
              seoOgImage: t.seoOgImage || "",
            });
          } catch (translationError) {
            console.error(`Çeviri kaydetme hatası (${lang.code}):`, translationError);
            throw new Error(`${lang.code} dili için çeviri kaydedilemedi: ${translationError.response?.data?.message || translationError.message}`);
          }
        }
      }

      // 3️⃣ Katalogları kaydet
      for (const c of formData.catalogs) {
        if (c.name && c.fileUrl) {
          try {
            await axiosInstance.post("/technologies/catalog", {
              technologyId: finalTechId,
              name: c.name,
              fileUrl: c.fileUrl,
            });
          } catch (catalogError) {
            console.error("Katalog kaydetme hatası:", catalogError);
            // Katalog hatası kritik değil, devam et
          }
        }
      }

      await fetchTechnologies();
      setFormData(createEmptyFormData());
      setSelectedId(null);
      showSuccess("Teknoloji başarıyla kaydedildi!");
    } catch (e) {
      console.error("Kaydetme hatası:", e);
      const errorMessage = e.response?.data?.message || e.message || "Teknoloji kaydedilirken bir hata oluştu";
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (tech) => {
    const formattedData = formatTechnologyForForm(tech);
    setFormData(formattedData);
    setSelectedId(tech.id);
    // Eğer textContent varsa text, yoksa image seçili olsun
    // textContent varsa ve boş değilse text, aksi halde image
    const hasTextContent = tech.textContent && tech.textContent.trim() !== "";
    setContentType(hasTextContent ? "text" : "image");
  };

  const startNew = () => {
    setFormData(createEmptyFormData());
    setSelectedId(null);
    setContentType("image");
  };

  const filteredTechnologies = technologies.filter((tech) => {
    const currentTranslation = tech.translations?.find(
      (t) => t.langCode === language
    );
    if (!currentTranslation) return false;
    return (
      currentTranslation.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      false ||
      currentTranslation.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      false
    );
  });

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("Bu teknolojiyi silmek istediğinize emin misiniz?");
    if (!confirmed) return;
    await axiosInstance.delete(`/technologies/${id}`);
    await fetchTechnologies();
    showSuccess("Teknoloji başarıyla silindi!");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Teknoloji Yönetimi
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Teknolojilerinizi yönetin ve düzenleyin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">Toplam Teknoloji:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {technologies.length}
              </span>
            </div>
            <button
              onClick={fetchTechnologies}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Yenile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Sidebar Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm md:text-base">Teknoloji Listesi</h3>
                <button
                  onClick={startNew}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors backdrop-blur-sm"
                >
                  <Plus size={14} />
                  <span className="hidden sm:inline">Yeni Teknoloji</span>
                  <span className="sm:hidden">Yeni</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="p-3 md:p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Teknoloji ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <div className="absolute left-3 top-2.5">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Technologies List */}
            <div className="p-3 md:p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-500 dark:text-gray-400 text-sm">Yükleniyor...</span>
                </div>
              ) : filteredTechnologies.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Layers className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm">Henüz teknoloji yok</p>
                  <button
                    onClick={startNew}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-medium"
                  >
                    İlk teknolojinizi oluşturun
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTechnologies.map((tech) => {
                    const currentTranslation = tech.translations.find(
                      (t) => t.langCode === language
                    );
                    const isSelected = selectedId === tech.id;

                    return (
                      <div
                        key={tech.id}
                        onClick={() => handleEdit(tech)}
                        className={`group flex items-center gap-2 md:gap-3 py-2 md:py-3 px-2 md:px-3 rounded-lg cursor-pointer select-none transition-all duration-200 ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 shadow-sm"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <div className="font-medium text-xs md:text-sm text-gray-900 dark:text-white truncate">
                              {currentTranslation?.title || "(Başlık yok)"}
                            </div>
                            {!tech.active && (
                              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                                Pasif
                              </span>
                            )}
                          </div>
                          {currentTranslation?.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate ml-4">
                              {currentTranslation.description.slice(0, 50) +
                                (currentTranslation.description.length > 50
                                  ? "..."
                                  : "")}
                            </div>
                          )}
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReorder(tech.id, "up");
                              }}
                              disabled={
                                filteredTechnologies.findIndex((t) => t.id === tech.id) === 0
                              }
                              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Yukarı Taşı"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReorder(tech.id, "down");
                              }}
                              disabled={
                                filteredTechnologies.findIndex((t) => t.id === tech.id) ===
                                filteredTechnologies.length - 1
                              }
                              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Aşağı Taşı"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(tech);
                            }}
                            className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 size={14} className="md:w-4 md:h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT DETAILS */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                    {formData.id ? "Teknoloji Düzenle" : "Yeni Teknoloji"}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formData.id
                      ? `ID: ${formData.id}`
                      : "Yeni bir teknoloji oluşturun"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      formData.active ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formData.active ? "Aktif" : "Pasif"}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-4 md:p-6">
              {/* Basic Information */}
              <div className="mb-6 md:mb-8">
                <h4 className="text-sm md:text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 md:h-6 bg-blue-500 rounded"></div>
                  Temel Bilgiler
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Status Toggle */}
                  <div className="space-y-2 md:space-y-3">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Durum
                    </label>
                    <button
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          active: !prev.active,
                        }))
                      }
                      className={`w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-all ${
                        formData.active
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700"
                      }`}
                    >
                      {formData.active ? (
                        <>
                          <Eye size={16} className="md:w-5 md:h-5" />
                          Aktif
                        </>
                      ) : (
                        <>
                          <EyeOff size={16} className="md:w-5 md:h-5" />
                          Pasif
                        </>
                      )}
                    </button>
                  </div>

                  {/* Language Indicator */}
                  <div className="space-y-2 md:space-y-3">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dil
                    </label>
                    <div className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-700 text-sm md:text-base">
                      <Globe size={16} className="md:w-5 md:h-5" />
                      <span className="font-medium">
                        {languages.find((lang) => lang.code === language)
                          ?.name || language.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="mb-6 md:mb-8">
                <h4 className="text-sm md:text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 md:h-6 bg-orange-500 rounded"></div>
                  İçerik
                </h4>

                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Başlık
                    </label>
                    <input
                      type="text"
                      placeholder={`${
                        languages.find((lang) => lang.code === language)
                          ?.name || "Dil"
                      } başlığı`}
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.translations[language]?.title || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [language]: {
                              ...prev.translations[language],
                              title: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Açıklama (Başlık Altında Gösterilecek)
                    </label>
                    <RichTextEditor
                      value={formData.translations[language]?.description || ""}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [language]: {
                              ...prev.translations[language],
                              description: value,
                            },
                          },
                        }))
                      }
                      placeholder={`${
                        languages.find((lang) => lang.code === language)
                          ?.name || "Dil"
                      } açıklaması - Bu metin başlık altında gösterilir`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Özellikler Açıklaması (Sekme İçinde Gösterilecek)
                    </label>
                    <RichTextEditor
                      value={formData.translations[language]?.featuresDescription || ""}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [language]: {
                              ...prev.translations[language],
                              featuresDescription: value,
                            },
                          },
                        }))
                      }
                      placeholder={`${
                        languages.find((lang) => lang.code === language)
                          ?.name || "Dil"
                      } özellikler açıklaması - Bu metin "Açıklama" sekmesinde gösterilir`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Slug (SEO URL) <span className="text-xs text-gray-500">(Boş bırakılırsa otomatik oluşturulur)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="teknoloji-slug-ornegi"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.translations[language]?.slug || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [language]: {
                              ...prev.translations[language],
                              slug: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      URL'de görünecek: /teknolojilerimiz/{formData.translations[language]?.slug || "teknoloji-slug"}
                    </p>
                  </div>
                </div>
              </div>

              {/* SEO Ayarları */}
              <div className="mb-6 md:mb-8">
                <h4 className="text-sm md:text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 md:h-6 bg-green-500 rounded"></div>
                  SEO Ayarları ({languages.find((lang) => lang.code === language)?.name || "Dil"})
                </h4>

                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SEO Başlık (Title)
                    </label>
                    <input
                      type="text"
                      placeholder="SEO için sayfa başlığı"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={formData.translations[language]?.seoTitle || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [language]: {
                              ...prev.translations[language],
                              seoTitle: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SEO Açıklama (Description)
                    </label>
                    <textarea
                      placeholder="SEO için meta açıklama"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows="3"
                      value={formData.translations[language]?.seoDescription || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [language]: {
                              ...prev.translations[language],
                              seoDescription: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SEO Anahtar Kelimeler (Keywords)
                    </label>
                    <input
                      type="text"
                      placeholder="anahtar, kelime, liste (virgülle ayrılmış)"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={formData.translations[language]?.seoKeywords || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [language]: {
                              ...prev.translations[language],
                              seoKeywords: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Open Graph Başlık (OG Title)
                    </label>
                    <input
                      type="text"
                      placeholder="Sosyal medya paylaşımı için başlık"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={formData.translations[language]?.seoOgTitle || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [language]: {
                              ...prev.translations[language],
                              seoOgTitle: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Open Graph Açıklama (OG Description)
                    </label>
                    <textarea
                      placeholder="Sosyal medya paylaşımı için açıklama"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows="2"
                      value={formData.translations[language]?.seoOgDescription || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [language]: {
                              ...prev.translations[language],
                              seoOgDescription: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Open Graph Görsel (OG Image URL)
                    </label>
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={formData.translations[language]?.seoOgImage || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [language]: {
                              ...prev.translations[language],
                              seoOgImage: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Content Type Selection (Image or Text) */}
              <div className="mb-6 md:mb-8">
                <h4 className="text-sm md:text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 md:h-6 bg-purple-500 rounded"></div>
                  İçerik Tipi
                </h4>

                <div className="mb-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        // Sadece contentType'ı değiştir, verileri temizleme
                        // Save işleminde contentType'a göre hangi alan gönderileceği belirleniyor
                        setContentType("image");
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        contentType === "image"
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      <ImageIcon size={18} />
                      Resim
                    </button>
                    <button
                      onClick={() => {
                        // Sadece contentType'ı değiştir, verileri temizleme
                        // Save işleminde contentType'a göre hangi alan gönderileceği belirleniyor
                        setContentType("text");
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        contentType === "text"
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      <FileText size={18} />
                      Metin
                    </button>
                  </div>
                </div>

                {/* Image Upload Section */}
                {contentType === "image" && (
                  <div className="space-y-3 md:space-y-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "image")}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 w-full p-4 md:p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors bg-gray-50 dark:bg-gray-700/50"
                      >
                        <ImageIcon size={20} className="text-gray-400 md:w-6 md:h-6" />
                        <div className="text-center">
                          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">
                            {uploading ? "Yükleniyor..." : "Görsel Seç"}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            PNG, JPG, WEBP formatları desteklenir
                          </p>
                        </div>
                        {uploading && (
                          <Loader2
                            className="animate-spin text-blue-500"
                            size={20}
                          />
                        )}
                      </label>
                    </div>

                    {formData.imageUrl && (
                      <div className="relative group">
                        <img
                          src={formData.imageUrl}
                          alt="technology"
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <button
                            onClick={async () => {
                              setDeletingImage(true);
                              try {
                                setFormData((prev) => ({ ...prev, imageUrl: "" }));
                              } finally {
                                setDeletingImage(false);
                              }
                            }}
                            disabled={deletingImage}
                            className="text-white bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2"
                          >
                            {deletingImage ? (
                              <>
                                <Loader2 className="animate-spin" size={14} />
                                Kaldırılıyor...
                              </>
                            ) : (
                              "Kaldır"
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Text Content Section */}
                {contentType === "text" && (
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Metin İçeriği
                      </label>
                      <RichTextEditor
                        value={formData.textContent || ""}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            textContent: value,
                          }))
                        }
                        placeholder="Teknoloji için metin içeriği girin..."
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        HTML etiketleri kullanılabilir
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Catalogs Section */}
              <div className="mb-6 md:mb-8">
                <h4 className="text-sm md:text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 md:h-6 bg-green-500 rounded"></div>
                  Kataloglar
                </h4>

                <div className="space-y-3 md:space-y-4">
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, "catalog")}
                      className="hidden"
                      id="catalog-upload"
                      disabled={uploadingCatalog}
                    />
                    <label
                      htmlFor="catalog-upload"
                      className={`flex items-center justify-center gap-2 md:gap-3 w-full p-3 md:p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-colors bg-gray-50 dark:bg-gray-700/50 ${uploadingCatalog ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'}`}
                    >
                      {uploadingCatalog ? (
                        <>
                          <Loader2 className="animate-spin text-gray-400 md:w-5 md:h-5" />
                          <span className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">
                            Yükleniyor...
                          </span>
                        </>
                      ) : (
                        <>
                          <File size={18} className="text-gray-400 md:w-5 md:h-5" />
                          <span className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">
                            Katalog Ekle
                          </span>
                        </>
                      )}
                    </label>
                  </div>

                  <div className="space-y-2">
                    {formData.catalogs.map((cat, i) => (
                      <div
                        key={cat.id || i}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                      >
                        <a
                          href={cat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-2 text-sm md:text-base"
                        >
                          <File size={14} className="md:w-4 md:h-4" />
                          <span className="truncate">{cat.name}</span>
                        </a>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            setDeletingCatalogIndex(i);
                            try {
                              // Eğer catalog'un ID'si varsa (backend'de kayıtlı), backend'den sil
                              if (cat.id && formData.id) {
                                try {
                                  console.log("Silinecek catalog ID:", cat.id);
                                  await axiosInstance.delete(`/technologies/catalog/${cat.id}`);
                                  showSuccess("Katalog başarıyla silindi!");
                                  // Backend'den silindikten sonra listeyi yenile
                                  await fetchTechnologies();
                                  // Teknolojiyi tekrar yükle
                                  const updatedTech = technologies.find(t => t.id === formData.id);
                                  if (updatedTech) {
                                    const formattedData = formatTechnologyForForm(updatedTech);
                                    setFormData(formattedData);
                                  }
                                } catch (error) {
                                  console.error("Katalog silme hatası:", error);
                                  console.error("Error response:", error.response);
                                  showError(error.response?.data?.message || "Katalog silinirken bir hata oluştu");
                                  return;
                                }
                              } else {
                                // ID yoksa sadece frontend'den kaldır
                                setFormData((prev) => ({
                                  ...prev,
                                  catalogs: prev.catalogs.filter(
                                    (_, index) => index !== i
                                  ),
                                }));
                              }
                            } finally {
                              setDeletingCatalogIndex(null);
                            }
                          }}
                          disabled={deletingCatalogIndex === i}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed p-1 flex-shrink-0 flex items-center justify-center"
                        >
                          {deletingCatalogIndex === i ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <XCircle size={16} className="md:w-5 md:h-5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  {formData.id && (
                    <button
                      onClick={() => handleDelete(formData.id)}
                      className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg transition-colors text-sm md:text-base flex-1 sm:flex-none"
                    >
                      <Trash2 size={14} className="md:w-4 md:h-4" />
                      Sil
                    </button>
                  )}
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg font-medium transition-colors text-sm md:text-base"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin md:w-4 md:h-4" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save size={14} className="md:w-4 md:h-4" />
                      Kaydet
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

export default TechnologySettings;
