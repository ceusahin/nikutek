import ProjectsPageMain from "../components/site/ProjectsPageMain";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import PageContent from "../layouts/PageContent";
import BottomContact from "../components/site/BottomContact";
import ProductSlider from "../components/site/ProductSlider";

function ProjectsPage() {
  return (
    <PageContent>
      <Header />
      <ProjectsPageMain />
      <ProductSlider />
      <BottomContact />
      <Footer />
    </PageContent>
  );
}

export default ProjectsPage;
