import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FadeContent from "../../utils/FadeContent";
import MoreButton from "../../utils/MoreButton";
import OurServicesCard from "./OurServicesCard";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";

function OurServices() {
  const [services, setServices] = useState([]);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const moreButtonText =
    language === "tr" ? "Tüm Teknolojilerimiz" : "All Technologies";

  useEffect(() => {
    axiosInstance
      .get("/technologies")
      .then((res) => {
        // Sıralama uygula
        const sorted = res.data.sort((a, b) => {
          const orderA = a.displayOrder ?? a.order ?? a.id ?? 0;
          const orderB = b.displayOrder ?? b.order ?? b.id ?? 0;
          return orderA - orderB;
        });
        // Sadece mevcut dilde çevirisi olan aktif teknolojileri göster
        const activeServices = sorted.filter(
          (s) => s.active && s.translations?.some((t) => t.langCode === language)
        );
        setServices(activeServices);
      })
      .catch((err) => console.error("Servisler alınamadı:", err));
  }, [language]);

  return (
    <FadeContent
      blur={false}
      duration={1000}
      easing="ease-out"
      initialOpacity={0}
    >
      <section className="mt-24 px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-44">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          <div className="text-center md:text-left">
            <h2 className="text-lg md:text-3xl text-gray-500 font-medium">
              {language === "tr" ? "Teknolojilerimiz" : "Our Technologies"}
            </h2>
            <h1 className="text-2xl md:text-4xl 2xl:text-5xl font-bold mt-2 leading-snug">
              {language === "tr"
                ? <>Sürdürülebilir çevre için<br className="hidden md:block" />yenilikçi çözümler</>
                : <>Innovative solutions<br className="hidden md:block" />for a sustainable environment</>}
            </h1>
          </div>

          <div className="flex justify-center md:justify-end w-full md:w-auto" onClick={() => navigate(language === "tr" ? "/teknolojilerimiz" : "/technologies")}>
            <MoreButton text={moreButtonText} />
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4 md:gap-5 lg:gap-6 px-2">
          {services.map((service) => {
            const tr =
              service.translations.find((t) => t.langCode === language) ||
              service.translations[0];
            return (
              <OurServicesCard
                key={service.id}
                id={service.id}
                slug={tr?.slug}
                name={tr?.title || "Başlık Yok"}
                description={tr?.description || ""}
              />
            );
          })}
        </div>
      </section>
    </FadeContent>
  );
}

export default OurServices;
