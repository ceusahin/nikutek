import { useState, useEffect } from "react";
import FadeContent from "../../utils/FadeContent";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";
import {
  Play,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

// YouTube Video Component
function YouTubeVideo({ videoId, title }) {
  return (
    <div className="relative w-full h-full group">
      <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="absolute bottom-2 right-2 bg-red-600 text-white px-2 py-1 text-sm rounded flex items-center gap-1">
        <Play size={12} />
        Video
      </div>
    </div>
  );
}

// Image Gallery Component
function ImageGallery({ images, title, onImageClick }) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="relative w-full h-full group overflow-hidden">
      <div
        className="flex w-full h-full transform transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${title} - ${index + 1}`}
            className="w-full h-full object-contain flex-shrink-0 cursor-pointer"
            onClick={() => onImageClick(index)}
          />
        ))}
      </div>

      {/* Başlık overlay */}
      <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 text-sm rounded flex items-center gap-1">
        <ImageIcon size={12} />
        {title}
      </div>

      {/* Navigation butonları */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <button
          className="bg-black/30 hover:bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-50 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          disabled={isAnimating}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          className="bg-black/30 hover:bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-50 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          disabled={isAnimating}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// Image Modal Component
function ImageModal({ isOpen, onClose, images, currentIndex, onNavigate }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onNavigate(currentIndex - 1);
          break;
        case "ArrowRight":
          onNavigate(currentIndex + 1);
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, currentIndex, onClose, onNavigate]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <div
        className="relative max-w-7xl max-h-full p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
        >
          <X size={20} />
        </button>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => onNavigate(currentIndex - 1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => onNavigate(currentIndex + 1)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Image */}
        <img
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
        />

        {/* Image counter */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}

export default function BlogPageMain() {
  const { language } = useLanguage();
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchBlogPosts();
  }, [language]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/blog");

      // Sadece aktif blogları filtrele, sırala ve mevcut dildeki çevirileri al
      const sortedBlogs = response.data.sort((a, b) => {
        const orderA = a.displayOrder ?? a.order ?? a.id ?? 0;
        const orderB = b.displayOrder ?? b.order ?? b.id ?? 0;
        return orderA - orderB;
      });
      const activeBlogs = sortedBlogs
        .filter((post) => post.active)
        .map((post) => {
          const translation =
            post.translations?.find((t) => t.languageCode === language) ||
            post.translations?.[0];
          // Video ID'yi çıkar (backend tam URL gönderiyor)
          let videoId = null;
          if (post.videoLink) {
            // YouTube URL'inden video ID'yi çıkar
            if (post.videoLink.includes("v=")) {
              videoId = post.videoLink.split("v=")[1].split("&")[0];
            } else if (post.videoLink.includes("youtu.be/")) {
              videoId = post.videoLink.split("youtu.be/")[1].split("?")[0];
            } else if (post.videoLink.match(/^[a-zA-Z0-9_-]{11}$/)) {
              videoId = post.videoLink; // Zaten video ID
            }
          }

          return {
            id: post.id,
            type: post.type,
            title: translation?.title || (language === "tr" ? "Başlık Yok" : "No Title"),
            description: translation?.description || "",
            videoId: videoId,
            images: post.images?.map((img) => img.imageUrl) || [],
          };
        });

      setBlogPosts(activeBlogs);
    } catch (error) {
      console.error("Blog posts yüklenirken hata:", error);
      // Fallback data
      setBlogPosts([
        {
          id: 1,
          type: "images",
          title: "Proje 1",
          images: [
            "/images/main-slider-1.webp",
            "/images/main-slider-3.webp",
            "/images/main-slider-2.webp",
          ],
        },
        {
          id: 2,
          type: "video",
          title: "Proje 2",
          videoId: "dQw4w9WgXcQ", // YouTube video ID
        },
        {
          id: 3,
          type: "images",
          title: "Proje 3",
          images: [
            "/images/main-slider-4.webp",
            "/images/main-slider-3.webp",
            "/images/main-slider-1.webp",
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (postIndex, imageIndex) => {
    const post = blogPosts[postIndex];
    if (post.type === "images") {
      setModalImages(post.images);
      setCurrentImageIndex(imageIndex);
      setModalOpen(true);
    }
  };

  const handleModalNavigate = (newIndex) => {
    if (newIndex < 0) {
      setCurrentImageIndex(modalImages.length - 1);
    } else if (newIndex >= modalImages.length) {
      setCurrentImageIndex(0);
    } else {
      setCurrentImageIndex(newIndex);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalImages([]);
    setCurrentImageIndex(0);
  };

  if (loading) {
    return (
      <FadeContent
        blur={false}
        duration={1000}
        easing="ease-out"
        initialOpacity={0}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-500">{language === "tr" ? "Yükleniyor..." : "Loading..."}</span>
          </div>
        </div>
      </FadeContent>
    );
  }

  return (
    <FadeContent
      blur={false}
      duration={1000}
      easing="ease-out"
      initialOpacity={0}
    >
      <div className="container mx-auto px-4 py-8 pt-32 md:pt-36 lg:pt-40 xl:pt-44 2xl:pt-48">
        <div className="text-center mb-10">
          <h2 className="text-2xl xl:text-3xl font-medium text-[#747474]">
            {language === "tr" 
              ? "Blog, Resim & Video Galerisi ve Haberler" 
              : "Blog, Image & Video Gallery and News"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, idx) => (
            <div
              key={post.id || idx}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {/* Media Content */}
              <div className="aspect-[4/3] overflow-hidden">
                {post.type === "video" ? (
                  <YouTubeVideo videoId={post.videoId} title={post.title} />
                ) : (
                  <ImageGallery
                    images={post.images}
                    title={post.title}
                    onImageClick={(imageIndex) =>
                      handleImageClick(idx, imageIndex)
                    }
                  />
                )}
              </div>

              {/* Content Info */}
              <div className="p-4">
                <h3
                  className="text-lg font-semibold text-gray-900 mb-2 overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {post.title}
                </h3>
                {post.description && (
                  <div
                    className="text-gray-600 text-sm mb-3 overflow-hidden"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                    dangerouslySetInnerHTML={{ __html: post.description }}
                  />
                )}

                {/* Type Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {post.type === "video" ? (
                      <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                        <Play size={12} />
                        Video
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        <ImageIcon size={12} />
                        {language === "tr" ? "Galeri" : "Gallery"} ({post.images?.length || 0})
                      </div>
                    )}
                  </div>

                  {post.type === "images" && post.images?.length > 0 && (
                    <button
                      onClick={() => handleImageClick(idx, 0)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink size={12} />
                      {language === "tr" ? "Görüntüle" : "View"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Image Modal */}
        {modalOpen && (
          <ImageModal
            isOpen={modalOpen}
            onClose={closeModal}
            images={modalImages}
            currentIndex={currentImageIndex}
            onNavigate={handleModalNavigate}
          />
        )}
      </div>
    </FadeContent>
  );
}
