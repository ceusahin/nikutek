import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";
import { getLocalizedPath } from "../../utils/routeUtils";

function ProjectsMainPageCard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axiosInstance.get("/products");
        // Sıralama uygula
        const sorted = (res.data || []).sort((a, b) => {
          const orderA = a.displayOrder ?? a.order ?? a.id ?? 0;
          const orderB = b.displayOrder ?? b.order ?? b.id ?? 0;
          return orderA - orderB;
        });
        // Sadece mevcut dilde çevirisi olan parent ürünleri göster
        const mainProducts = sorted.filter(
          (item) => 
            item.parentId === null && 
            item.active !== false &&
            item.translations?.some((t) => t.langCode === language)
        );
        setProjects(mainProducts);
      } catch (err) {
        console.error("Ürünler alınamadı:", err);
      }
    };
    fetchProjects();
  }, [language]);

  return (
    <div>
      <div className="flex flex-wrap w-full justify-center gap-4 md:gap-5 lg:gap-6">
        {projects.map((project) => {
          const translation =
            project.translations?.find((t) => t.langCode === language) ||
            project.translations?.[0] ||
            {};

          const activeChildren = (project.children || []).filter(
            (c) => c.active !== false
          );
          const isCategory =
            (project.hasChildren || project.children?.length > 0) &&
            activeChildren.length > 0;

          const translationSlug = translation?.slug;
          
          return (
            <div
              key={project.id}
              onClick={() => {
                if (isCategory) {
                  // Kategori sayfasına slug ile git
                  if (translationSlug) {
                    navigate(getLocalizedPath("category", translationSlug, language));
                  } else {
                    navigate(getLocalizedPath("category", project.id, language)); // Fallback: ID kullan
                  }
                } else if (translationSlug) {
                  navigate(getLocalizedPath("projectDetail", translationSlug, language));
                } else {
                  navigate(getLocalizedPath("projectDetail", project.id, language)); // Fallback: ID kullan
                }
              }}
              className="group relative cursor-pointer 
                         h-[300px] w-[95vw] sm:w-[400px] md:w-[420px] lg:w-[450px] xl:w-[430px] 2xl:w-[450px] xl:h-[400px]
                         bg-gradient-to-b from-[#fdf001] to-black rounded-3xl overflow-hidden 
                         shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_40px_#fdf001aa] 
                         transition-all duration-500"
            >
              {/* Başlık */}
              <div
                className="absolute top-1/2 left-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2
                           flex flex-col items-center text-center transition-transform duration-500 
                           group-hover:-translate-y-[100px]"
              >
                <h3 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                  {translation.title || (language === "tr" ? "İsimsiz Ürün" : "Untitled Product")}
                </h3>
              </div>

              {/* Açıklama ve Buton */}
              <div
                className="absolute bottom-4 sm:bottom-6 left-0 w-full z-20 px-4 sm:px-6 
                           opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 
                           transition-all duration-500 text-center"
              >

                <button className="bg-[#fdf001] text-black text-base sm:text-lg px-5 sm:px-7 py-2.5 sm:py-3 rounded-md hover:bg-yellow-300 transition-colors shadow-lg font-semibold">
                  {isCategory 
                    ? (language === "tr" ? "Ürünleri Gör" : "View Products") 
                    : (language === "tr" ? "Detayları Gör" : "View Details")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProjectsMainPageCard;
