import { Construction, Hammer, HardHat } from "lucide-react";
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";
import FadeContent from "../../utils/FadeContent";
import renderHTML from "../../utils/renderHTML";

function AboutUsMainPage() {
  const { language } = useLanguage();
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/about-us/${language}`);
        if (res.data && res.data.length > 0) {
          setAboutData(res.data[0]);
        } else {
          setAboutData(null);
        }
      } catch (err) {
        console.error("About us verisi alınamadı:", err);
        setAboutData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, [language]);

  if (loading) {
    return (
      <div className="text-center mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fdf001] mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">
          {language === "tr" ? "Hakkımızda bilgileri yükleniyor..." : "Loading about us information..."}
        </p>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="text-center mt-20 text-red-600 text-lg">
        {language === "tr" ? "Hakkımızda bilgileri bulunamadı." : "About us information not found."}
      </div>
    );
  }

  return (
    <FadeContent
      blur={false}
      duration={1000}
      easing="ease-out"
      initialOpacity={0}
    >
      <div className="mt-20 px-4 sm:px-8 xl:mx-36 flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
        {/* Sol taraf */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-start">
          <h1 className="text-base md:text-2xl font-medium text-[#747474]">
            {language === "tr" ? "Hakkımızda" : "About Us"}
          </h1>
          <h2 className="text-2xl md:text-4xl xl:text-5xl font-bold mt-2 leading-snug">
            {aboutData.title}
          </h2>
          <div className="text-sm md:text-lg text-[#747474] mt-3 leading-relaxed">
            {renderHTML(aboutData.paragraph)}
          </div>

          <ul className="flex flex-col gap-6 mt-10">
            {[
              aboutData.smallTitle1,
              aboutData.smallTitle2,
              aboutData.smallTitle3,
            ].map((title, i) => {
              const icons = [Construction, Hammer, HardHat];
              const Icon = icons[i];
              return (
                <li key={i} className="flex gap-4 items-start">
                  <Icon
                    size={60}
                    className="rounded-full p-3 bg-[#fdf001] text-black"
                  />
                  <div>
                    <h3 className="text-lg md:text-2xl font-semibold">
                      {title}
                    </h3>
                    <div className="text-sm md:text-lg text-[#747474]">
                      {renderHTML(aboutData[`smallText${i + 1}`])}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sağ taraf */}
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          {aboutData.mediaUrl && (
            <img
              src={aboutData.mediaUrl}
              alt={aboutData.title}
              className="w-full max-w-[500px] rounded-3xl object-contain"
            />
          )}
        </div>
      </div>
    </FadeContent>
  );
}

export default AboutUsMainPage;
