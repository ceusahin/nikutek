import { useNavigate } from "react-router-dom";
import ProjectsMainPageCard from "./ProjectsMainPageCard";
import MoreButton from "../../utils/MoreButton";
import FadeContent from "../../utils/FadeContent";
import useLanguage from "../../hooks/useLanguage";
import { getLocalizedPath } from "../../utils/routeUtils";

function ProjectsMainPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const moreButtonText = language === "tr" ? "Tüm Ürünlerimiz" : "All Our Products";

  return (
    <FadeContent
      blur={false}
      duration={1000}
      easing="ease-out"
      initialOpacity={0}
    >
      <div className="mt-24 px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-44 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="w-full md:w-auto text-center md:text-left">
            <h1 className="text-lg md:text-3xl text-gray-500 font-medium">
              {language === "tr" ? "Ürünlerimiz" : "Our Products"}
            </h1>
            <h2 className="text-2xl md:text-5xl font-bold mt-2 leading-snug">
              {language === "tr" 
                ? <>Nikutek, çevre odaklı <br className="hidden md:block" /> ürünlerimizle hizmetinizde</>
                : <>Nikutek is at your service with <br className="hidden md:block" /> our environmentally focused products</>}
            </h2>
          </div>

          <div className="flex justify-center md:justify-end w-full md:w-auto" onClick={() => navigate(getLocalizedPath("projects", "", language))}>
            <MoreButton text={moreButtonText} />
          </div>
        </div>

        <ProjectsMainPageCard />
      </div>
    </FadeContent>
  );
}

export default ProjectsMainPage;
