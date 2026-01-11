import { useEffect, useState } from "react";
import FadeContent from "../../utils/FadeContent";
import OurServicesCard from "./OurServicesCard";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";

function ServicePageServiceSection() {
  const [services, setServices] = useState([]);
  const { language } = useLanguage();

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
      <section className="px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-44 pt-32 md:pt-36 lg:pt-40 xl:pt-44 2xl:pt-48">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          <div className="mb-6 md:mb-0 text-center md:text-left w-full md:w-auto">
            <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-500 font-medium">
              {language === "tr" ? "Teknolojilerimiz" : "Our Technologies"}
            </h2>
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mt-2 leading-tight">
              {language === "tr"
                ? "Sürdürülebilir çevre için yenilikçi çözümler"
                : "Innovative solutions for a sustainable environment"}
            </h1>
          </div>
        </div>

        <div className="mt-8 md:mt-10 lg:mt-12 flex flex-wrap justify-center gap-4 md:gap-6">
          {services.map((service) => {
            const tr =
              service.translations.find((t) => t.langCode === language) ||
              service.translations[0];
            return (
              <OurServicesCard
                key={service.id}
                id={service.id}
                slug={tr?.slug}
                img={service.imageUrl}
                name={tr?.title || (language === "tr" ? "Başlık Yok" : "No Title")}
                description={tr?.description || ""}
              />
            );
          })}
        </div>
      </section>
    </FadeContent>
  );
}

export default ServicePageServiceSection;
