import ReferencesPageMain from "../components/site/ReferencesPageMain";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import PageContent from "../layouts/PageContent";
import BottomContact from "../components/site/BottomContact";
import ProductSlider from "../components/site/ProductSlider";

function ReferencesPage() {
  return (
    <PageContent>
      <Header />
      <ReferencesPageMain />
      <ProductSlider />
      <BottomContact />
      <Footer />
    </PageContent>
  );
}

export default ReferencesPage;
