import ServicePageServiceSection from "../components/site/ServicePageServiceSection";
import BottomContact from "../components/site/BottomContact";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import PageContent from "../layouts/PageContent";
import ProductSlider from "../components/site/ProductSlider";

function ServicePage() {
  return (
    <PageContent>
      <Header />
      <ServicePageServiceSection />
      <ProductSlider />
      <BottomContact />
      <Footer />
    </PageContent>
  );
}

export default ServicePage;
