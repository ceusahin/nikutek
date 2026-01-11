import { Link } from "react-router-dom";
import useLanguage from "../../hooks/useLanguage";
import { getLocalizedPath } from "../../utils/routeUtils";

function OurServicesCard({ id, name, description, slug }) {
  const { language } = useLanguage();
  const path = slug 
    ? getLocalizedPath("serviceDetail", slug, language)
    : getLocalizedPath("serviceDetail", id, language);
  return (
    <Link
      to={path}
      className="group relative block 
                 h-[300px] sm:h-[340px] md:h-[370px] lg:h-[400px] xl:h-[400px]
                 w-[95vw] sm:w-[400px] md:w-[420px] lg:w-[450px] xl:w-[430px] 2xl:w-[450px]
                 bg-gradient-to-b from-[#fdf001] to-black rounded-3xl overflow-hidden 
                 shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_40px_#fdf001aa] 
                 transition-shadow duration-500"
    >
      {/* Başlık */}
      <div
        className="absolute top-1/2 left-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2
                   flex flex-col items-center text-center transition-transform duration-500 
                   group-hover:-translate-y-[100px]"
      >
        <h3 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
          {name}
        </h3>
      </div>

      {/* Açıklama ve Buton */}
      <div
        className="absolute bottom-4 sm:bottom-6 left-0 w-full z-20 px-4 sm:px-6 opacity-0 translate-y-8 
                   group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 text-center"
      >

        <button className="bg-[#fdf001] text-black text-base sm:text-lg px-5 sm:px-7 py-2.5 sm:py-3 rounded-md hover:bg-yellow-300 transition-colors shadow-lg font-semibold">
          {language === "tr" ? "Daha Fazla Bilgi" : "Learn More"}
        </button>
      </div>
    </Link>
  );
}

export default OurServicesCard;
