import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";
import TextType from "../../utils/TextType";
import renderHTML from "../../utils/renderHTML";

const HeroSection = () => {
  const { language } = useLanguage();
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/main-hero/${language}`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setHeroData(res.data[0]);
        } else {
          setHeroData(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Hero verisi alınamadı:", err);
        setHeroData(null);
        setLoading(false);
      });
  }, [language]);

  if (loading)
    return (
      <div className="text-center py-20">
        {language === "tr" ? "Yükleniyor..." : "Loading..."}
      </div>
    );
  if (!heroData)
    return (
      <div className="text-center py-20">
        {language === "tr" ? "Veri bulunamadı." : "Data not found."}
      </div>
    );
    // h-[40vh] sm:h-[45vh] md:h-[50vh] lg:h-[52vh] 
  return (
    <div className="relative w-full h-[53vh] overflow-hidden">
      {heroData.imageUrl && (
        <img
          src={heroData.imageUrl}
          alt={heroData.header || "Hero"}
          className="w-full h-full object-cover object-center"
        />
      )}

      <div className="absolute inset-0 bg-black/40 z-10"></div>

      <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <TextType
          text={heroData?.header || ""}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight px-2 sm:px-0"
          typingSpeed={120}
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter="|"
        />

        {heroData.paragraph && (
          <div className="text-white text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl mb-4 sm:mb-6 max-w-[90%] sm:max-w-[700px] leading-relaxed px-2 sm:px-0">
            {renderHTML(heroData.paragraph)}
          </div>
        )}

        <div className="flex flex-row gap-2 sm:gap-3 md:gap-4 justify-center w-full sm:w-auto items-center px-2 sm:px-0 flex-wrap">
          {heroData.button1Text && heroData.button1Url && (
            <a
              href={heroData.button1Url}
              className="relative overflow-hidden group text-xs sm:text-sm md:text-base lg:text-lg font-semibold border-2 border-white text-white hover:text-black hover:border-[#fdf001] px-4 py-1.5 sm:px-6 sm:py-2 md:px-8 md:py-2.5 lg:px-10 lg:py-3 rounded transition-all duration-500 cursor-pointer whitespace-nowrap"
            >
              <span className="absolute left-0 top-0 h-full w-0 bg-[#fdf001] transition-[width] duration-500 ease-in-out group-hover:w-full"></span>
              <span className="relative z-10">{heroData.button1Text}</span>
            </a>
          )}

          {heroData.button2Text && heroData.button2Url && (
            <a
              href={heroData.button2Url}
              className="relative overflow-hidden group text-xs sm:text-sm md:text-base lg:text-lg font-semibold border-2 border-white text-white hover:text-black hover:border-[#fdf001] px-4 py-1.5 sm:px-6 sm:py-2 md:px-8 md:py-2.5 lg:px-10 lg:py-3 rounded transition-all duration-500 cursor-pointer whitespace-nowrap"
            >
              <span className="absolute left-0 top-0 h-full w-0 bg-[#fdf001] transition-[width] duration-500 ease-in-out group-hover:w-full"></span>
              <span className="relative z-10">{heroData.button2Text}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
