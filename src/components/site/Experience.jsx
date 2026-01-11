import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";
import CountUp from "../../utils/CountUp";

const Experience = () => {
  const { language } = useLanguage();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/experience")
      .then((res) => {
        const visibleExperiences = res.data
          .filter((exp) => exp.visible)
          .slice(0, 4);
        setExperiences(visibleExperiences);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Experiences verisi alınamadı:", err);
        setExperiences([]);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="text-center py-20">
        {language === "tr" ? "Yükleniyor..." : "Loading..."}
      </div>
    );
  if (!experiences.length)
    return (
      <div className="text-center py-20">
        {language === "tr" ? "Veri bulunamadı." : "Data not found."}
      </div>
    );

  return (
    <div
      className="
        w-[80%] md:w-[70%] mx-auto rounded-lg shadow-lg 
        px-4 py-6 md:px-4 md:py-8 mt-10 xl:mt-0 font-bold z-10 relative overflow-hidden
        bg-[#fdf001] md:bg-[linear-gradient(-120deg,#fdf001_50%,#000_50%)]
      "
    >
      {/* GRID düzeni: mobilde 2 sütun, masaüstünde 4 sütun */}
      <div
        className="
          grid 
          grid-cols-2 
          md:grid-cols-4 
          gap-6 
          text-center
        "
      >
        {experiences.map((exp, index) => {
          const tr =
            exp.translations.find((t) => t.language === language) ||
            exp.translations[0];

          // Masaüstünde: sol 2 sarı, sağ 2 siyah
          // Mobilde: hepsi siyah metin (çünkü arka plan sarı)
          const textColorClass = `
            ${index < 2 ? "md:text-[#fdf001]" : "md:text-black"} 
            text-black
          `;

          return (
            <div
              key={exp.id}
              className={`flex flex-col items-center justify-center ${textColorClass}`}
            >
              <div className="flex items-center gap-1 md:gap-2 text-3xl md:text-5xl font-semibold">
                <CountUp
                  className="count-up-text"
                  from={0}
                  to={parseInt(tr.numberText.replace(/\D/g, "")) || 0}
                  separator=","
                  direction="up"
                  duration={1}
                />
                <h1>+</h1>
              </div>
              <p className="text-sm md:text-xl mt-1 md:mt-2">{tr.labelText}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Experience;
