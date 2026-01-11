import CompanyInfo from "../components/site/CompanyInfo";
import ContactForm from "../components/site/ContactForm";
import ProjectDetails from "../components/site/ProjectDetails";
import References from "../components/site/ReferencesAboutPage";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import PageContent from "../layouts/PageContent";
import BottomContact from "../components/site/BottomContact";
import ProductSlider from "../components/site/ProductSlider";

function ProjectDetailPage() {
  return (
    <PageContent>
      <Header />
      <ProjectDetails />
      <ProductSlider />
      <BottomContact />
      <Footer />
    </PageContent>
  );
}

export default ProjectDetailPage;
