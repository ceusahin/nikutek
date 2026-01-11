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
  Image as ImageIcon,
  Video,
  Globe,
  Edit3,
  Eye,
  EyeOff,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronRight,
  X,
  Play,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const BlogSettings = () => {
  const { language } = useLanguage(); // tr / en
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [languages, setLanguages] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchPosts();
    fetchLanguages();
  }, [language]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/blog");
      // console.log(res.data);
      // displayOrder veya order'a göre sırala, yoksa id'ye göre
      const sortedPosts = res.data.sort((a, b) => {
        const orderA = a.displayOrder ?? a.order ?? a.id ?? 0;
        const orderB = b.displayOrder ?? b.order ?? b.id ?? 0;
        return orderA - orderB;
      });
      setPosts(sortedPosts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (postId, direction) => {
    try {
      const currentIndex = filteredPosts.findIndex((p) => p.id === postId);
      if (currentIndex === -1) return;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= filteredPosts.length) return;

      const updatedPosts = [...filteredPosts];
      [updatedPosts[currentIndex], updatedPosts[newIndex]] = [
        updatedPosts[newIndex],
        updatedPosts[currentIndex],
      ];

      // Backend'e sıralama güncellemesi gönder
      const reorderData = updatedPosts.map((post, index) => ({
        id: post.id,
        displayOrder: index + 1,
      }));

      await axiosInstance.put("/blog/reorder", { items: reorderData });
      await fetchPosts();
      showSuccess("Sıralama güncellendi!");
    } catch (err) {
      console.error("Sıralama güncelleme hatası:", err);
      showError("Sıralama güncellenirken bir hata oluştu.");
    }
  };

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
    // Sadece mevcut dil için boş form oluştur
    translations[language] = { title: "", description: "" };

    return {
      id: null,
      type: "images",
      active: true,
      videoId: "",
      translations,
      images: [],
    };
  };

  // Mevcut blog post verilerini formata çevirme
  const formatBlogPostForForm = (post) => {
    const translations = {};
    languages.forEach((lang) => {
      const existingTranslation = post.translations?.find(
        (t) => t.languageCode === lang.code
      );
      translations[lang.code] = {
        title: existingTranslation?.title || "",
        description: existingTranslation?.description || "",
      };
    });

    return {
      id: post.id,
      type: post.type,
      active: post.active,
      videoId: post.videoLink || "",
      translations,
      images: post.images || [],
    };
  };

  const handleFileChange = (e) => {
    setNewImages([...e.target.files]);
  };

  const handleSave = async () => {
    if (!editingPost) return;

    setError(null);
    setSuccess(null);

    const hasTitle = Object.values(editingPost.translations).some((t) =>
      t.title.trim()
    );
    if (!hasTitle) {
      setError("En az bir dilde başlık girmelisiniz.");
      return;
    }

    if (editingPost.type === "video" && !editingPost.videoId.trim()) {
      setError("Video tipi için YouTube Video ID girmelisiniz.");
      return;
    }

    if (
      editingPost.type === "images" &&
      newImages.length === 0 &&
      (!editingPost.images || editingPost.images.length === 0)
    ) {
      setError("Resim tipi için en az bir resim eklemelisiniz.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      // JSON'u Blob olarak ekle
      const blogPostData = {
        id: editingPost.id,
        type: editingPost.type,
        active: editingPost.active,
        videoLink: editingPost.type === "video" ? editingPost.videoId : null, // videoLink olarak gönder
        translations: Object.entries(editingPost.translations)
          .filter(([, trans]) => trans.title.trim() || trans.description.trim()) // Sadece dolu olanları gönder
          .map(([langCode, trans]) => ({
            languageCode: langCode,
            title: trans.title,
            description: trans.description,
          })),
        images: editingPost.images || [],
      };

      console.log("Gönderilen blog post data:", blogPostData);
      formData.append(
        "blogPost",
        new Blob([JSON.stringify(blogPostData)], { type: "application/json" })
      );

      if (newImages.length > 0) {
        newImages.forEach((file) => formData.append("images", file));
      }

      if (editingPost.id) {
        await axiosInstance.put(`/blog/${editingPost.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/blog", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setSuccess(
        editingPost.id
          ? "Blog başarıyla güncellendi!"
          : "Blog başarıyla oluşturuldu!"
      );
      setEditingPost(null);
      setNewImages([]);
      setSelectedId(null);
      await fetchPosts();
    } catch (err) {
      console.error("Blog kaydetme hatası:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Blog kaydedilirken bir hata oluştu."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(formatBlogPostForForm(post));
    setNewImages([]);
    setSelectedId(post.id);
    setError(null);
    setSuccess(null);
  };

  const startNew = () => {
    setEditingPost(createEmptyFormData());
    setNewImages([]);
    setSelectedId(null);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (postId) => {
    const confirmed = await showConfirm(
      "Bu blog yazısını silmek istediğinizden emin misiniz?"
    );
    if (!confirmed) {
      return;
    }

    try {
      await axiosInstance.delete(`/blog/${postId}`);
      setSuccess("Blog başarıyla silindi!");
      await fetchPosts();

      // Eğer silinen blog düzenleniyorsa, formu temizle
      if (selectedId === postId) {
        setEditingPost(null);
        setSelectedId(null);
      }
    } catch (err) {
      console.error("Blog silme hatası:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Blog silinirken bir hata oluştu."
      );
    }
  };

  const filteredPosts = posts.filter((post) => {
    const currentTranslation = post.translations?.find(
      (t) => t.languageCode === language
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

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Blog Yönetimi
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Blog yazılarınızı ve medya içeriklerinizi yönetin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Toplam Blog:
              </span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {posts.length}
              </span>
            </div>
            <button
              onClick={fetchPosts}
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
                <h3 className="text-white font-semibold">Blog Listesi</h3>
                <button
                  onClick={startNew}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
                >
                  <Plus size={14} />
                  Yeni Blog
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-3 md:p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Blog ara..."
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

            {/* Blog List */}
            <div className="p-3 md:p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-500 dark:text-gray-400 text-sm">Yükleniyor...</span>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Layers className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm">Henüz blog yok</p>
                  <button
                    onClick={startNew}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    İlk blog yazınızı oluşturun
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPosts.map((post) => {
                    const currentTranslation = post.translations?.find(
                      (t) => t.languageCode === language
                    );
                    const isSelected = selectedId === post.id;

                    return (
                      <div
                        key={post.id}
                        onClick={() => handleEdit(post)}
                        className={`group flex items-center gap-2 md:gap-3 py-2 md:py-3 px-2 md:px-3 rounded-lg cursor-pointer select-none transition-all duration-200 ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 shadow-sm"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                post.type === "video"
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              }`}
                            />
                            <div className="font-medium text-xs md:text-sm text-gray-900 dark:text-white truncate">
                              {currentTranslation?.title || "(Başlık yok)"}
                            </div>
                            {!post.active && (
                              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                                Pasif
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              {post.type === "video" ? (
                                <Play size={12} />
                              ) : (
                                <ImageIcon size={12} />
                              )}
                              {post.type === "video" ? "Video" : "Resimler"}
                            </span>
                          </div>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReorder(post.id, "up");
                              }}
                              disabled={filteredPosts.findIndex((p) => p.id === post.id) === 0}
                              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Yukarı Taşı"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReorder(post.id, "down");
                              }}
                              disabled={
                                filteredPosts.findIndex((p) => p.id === post.id) ===
                                filteredPosts.length - 1
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
                              handleEdit(post);
                            }}
                            className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 size={14} className="md:w-4 md:h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(post.id);
                            }}
                            className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={14} className="md:w-4 md:h-4" />
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
                    {editingPost?.id ? "Blog Düzenle" : "Yeni Blog"}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {editingPost?.id
                      ? `ID: ${editingPost.id}`
                      : "Yeni bir blog yazısı oluşturun"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      editingPost?.active ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                    {editingPost?.active ? "Aktif" : "Pasif"}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-4 md:p-6">
              {/* Hata ve Başarı Mesajları */}
              {error && (
                <div className="mb-4 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <X size={12} className="text-white" />
                    </div>
                    <span className="text-red-800 dark:text-red-400 font-medium text-sm md:text-base">Hata:</span>
                    <span className="text-red-700 dark:text-red-300 text-sm md:text-base">{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 md:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-green-800 dark:text-green-400 font-medium text-sm md:text-base">
                      Başarılı:
                    </span>
                    <span className="text-green-700 dark:text-green-300 text-sm md:text-base">{success}</span>
                  </div>
                </div>
              )}

              {editingPost ? (
                <div className="space-y-4 md:space-y-6">
                  {/* Type Selection */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 md:p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      İçerik Türü
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value="images"
                          checked={editingPost.type === "images"}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              type: e.target.value,
                            })
                          }
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex items-center gap-2">
                          <ImageIcon size={16} className="text-green-600" />
                          <span className="text-sm font-medium">
                            Resim Galerisi
                          </span>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value="video"
                          checked={editingPost.type === "video"}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              type: e.target.value,
                            })
                          }
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex items-center gap-2">
                          <Video size={16} className="text-red-600" />
                          <span className="text-sm font-medium">
                            YouTube Video
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Video Settings */}
                  {editingPost.type === "video" && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-3 md:p-4 rounded-lg border border-red-100 dark:border-red-800">
                      <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        YouTube Video ID
                      </label>
                      <input
                        type="text"
                        value={editingPost.videoId || ""}
                        onChange={(e) => {
                          console.log("Video ID değişti:", e.target.value);
                          setEditingPost({
                            ...editingPost,
                            videoId: e.target.value,
                          });
                        }}
                        placeholder="YouTube video ID'sini girin (örn: dQw4w9WgXcQ)"
                        className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        YouTube video URL'sinden ID kısmını kopyalayın
                      </p>
                    </div>
                  )}

                  {/* Image Upload */}
                  {editingPost.type === "images" && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 md:p-4 rounded-lg border border-green-100 dark:border-green-800">
                      <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Resim Yükle
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 md:p-4 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload size={20} className="text-gray-400 md:w-6 md:h-6" />
                          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                            Resimleri seçmek için tıklayın
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Birden fazla resim seçebilirsiniz
                          </span>
                        </label>
                      </div>
                      {newImages.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-2">
                            Seçilen resimler ({newImages.length}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(newImages).map((file, index) => (
                              <div
                                key={index}
                                className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs flex items-center gap-1"
                              >
                                <ImageIcon size={12} />
                                <span className="truncate max-w-[100px] md:max-w-[120px]">
                                  {file.name}
                                </span>
                                <button
                                  onClick={() => {
                                    const newFiles = Array.from(newImages);
                                    newFiles.splice(index, 1);
                                    setNewImages(newFiles);
                                  }}
                                  className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            ✓ Bu resimler kaydetme sırasında yüklenecek
                          </p>
                        </div>
                      )}

                      {/* Mevcut Resimler */}
                      {editingPost.images && editingPost.images.length > 0 && (
                        <div className="mt-3 md:mt-4">
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-2">
                            Mevcut resimler ({editingPost.images.length}):
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {editingPost.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image.imageUrl}
                                  alt={`Resim ${index + 1}`}
                                  className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                  onClick={() => {
                                    const newImages = editingPost.images.filter(
                                      (_, i) => i !== index
                                    );
                                    setEditingPost({
                                      ...editingPost,
                                      images: newImages,
                                    });
                                  }}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Language-based Content */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 md:p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                      <Globe size={14} className="text-purple-600 dark:text-purple-400 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Dil:{" "}
                        <span className="font-semibold">
                          {languages.find((lang) => lang.code === language)
                            ?.name || language.toUpperCase()}
                        </span>
                      </span>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Başlık
                        </label>
                        <input
                          type="text"
                          value={
                            editingPost.translations[language]?.title || ""
                          }
                          onChange={(e) => {
                            const newTranslations = {
                              ...editingPost.translations,
                            };
                            newTranslations[language] = {
                              ...newTranslations[language],
                              title: e.target.value,
                            };
                            setEditingPost({
                              ...editingPost,
                              translations: newTranslations,
                            });
                          }}
                          placeholder={`${
                            languages.find((lang) => lang.code === language)
                              ?.name || "Dil"
                          } başlığı`}
                          className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Açıklama
                        </label>
                        <RichTextEditor
                          value={
                            editingPost.translations[language]?.description ||
                            ""
                          }
                          onChange={(value) => {
                            const newTranslations = {
                              ...editingPost.translations,
                            };
                            newTranslations[language] = {
                              ...newTranslations[language],
                              description: value,
                            };
                            setEditingPost({
                              ...editingPost,
                              translations: newTranslations,
                            });
                          }}
                          placeholder={`${
                            languages.find((lang) => lang.code === language)
                              ?.name || "Dil"
                          } açıklaması`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Active Status */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {editingPost.active ? (
                            <Eye size={14} className="text-green-600 dark:text-green-400 md:w-4 md:h-4" />
                          ) : (
                            <EyeOff size={14} className="text-red-600 dark:text-red-400 md:w-4 md:h-4" />
                          )}
                          <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                            Blog Durumu
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            editingPost.active
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                          }`}
                        >
                          {editingPost.active ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingPost.active}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              active: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Aktif</span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setEditingPost(null);
                        setError(null);
                        setSuccess(null);
                      }}
                      className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm md:text-base"
                    >
                      <X size={14} className="md:w-4 md:h-4" />
                      İptal
                    </button>

                    <div className="flex items-center gap-2 md:gap-3">
                      {editingPost?.id && (
                        <button
                          onClick={() => handleDelete(editingPost.id)}
                          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base flex-1 sm:flex-none"
                        >
                          <Trash2 size={14} className="md:w-4 md:h-4" />
                          Sil
                        </button>
                      )}
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 text-white px-4 md:px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm md:text-base flex-1 sm:flex-none"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save size={14} className="md:w-4 md:h-4" />
                        )}
                        {saving ? "Kaydediliyor..." : "Kaydet"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 md:py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Layers className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Blog Seçin
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4 px-4">
                    Düzenlemek için sol taraftan bir blog seçin veya yeni bir
                    blog oluşturun
                  </p>
                  <button
                    onClick={startNew}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base"
                  >
                    <Plus size={14} className="md:w-4 md:h-4" />
                    Yeni Blog Oluştur
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogSettings;
