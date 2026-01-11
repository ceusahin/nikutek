import AboutUsMainPage from "../components/site/AboutUsMainPage";
import OurServices from "../components/site/OurServices";
import ProjectsMainPage from "../components/site/ProjectsMainPage";
import HeroSection from "../components/site/HeroSection";
import PageContent from "../layouts/PageContent";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import BottomContact from "../components/site/BottomContact";
import ProductSlider from "../components/site/ProductSlider";

function MainPage() {
  return (
    <PageContent>
      <Header />
      <div className="relative z-0">
        <HeroSection />
      </div>
      <ProjectsMainPage />
      <OurServices />
      <AboutUsMainPage />
      <ProductSlider />
      <BottomContact />
      <Footer />
    </PageContent>
  );
}

export default MainPage;
