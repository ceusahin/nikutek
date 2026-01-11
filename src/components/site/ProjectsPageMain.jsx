import FadeContent from "../../utils/FadeContent";
import ProjectsMainPageCard from "./ProjectsMainPageCard";
import useLanguage from "../../hooks/useLanguage";

const ProjectsPageMain = () => {
  const { language } = useLanguage();
  
  return (
    <FadeContent
      blur={false}
      duration={1000}
      easing="ease-out"
      initialOpacity={0}
    >
      <div className="px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-44 pt-32 md:pt-36 lg:pt-40 xl:pt-44 2xl:pt-48 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-10">
          <div className="w-full md:w-auto text-center md:text-left">
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mt-2 leading-tight mb-14">
              {language === "tr" ? "Ürünlerimiz" : "Our Products"}
            </h2>
          </div>
        </div>

        <ProjectsMainPageCard />
      </div>
    </FadeContent>
  );
};

export default ProjectsPageMain;
