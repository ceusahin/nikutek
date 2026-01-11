import AboutUsAboutPage from "../components/site/AboutUsAboutPage";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import PageContent from "../layouts/PageContent";
import BottomContact from "../components/site/BottomContact";
import ProductSlider from "../components/site/ProductSlider";

function AboutUs() {
  return (
    <PageContent>
      <Header />
      <AboutUsAboutPage />
      <ProductSlider />
      <BottomContact />
      <Footer />
    </PageContent>
  );
}

export default AboutUs;
