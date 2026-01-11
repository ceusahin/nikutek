import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import PageContent from "../layouts/PageContent";
import BottomContact from "../components/site/BottomContact";
import ServiceDetails from "../components/site/ServiceDetails";
import ProductSlider from "../components/site/ProductSlider";

function ServiceDetailPage() {
  return (
    <PageContent>
      <Header />
      <ServiceDetails />
      <ProductSlider />
      <BottomContact />
      <Footer />
    </PageContent>
  );
}

export default ServiceDetailPage;
