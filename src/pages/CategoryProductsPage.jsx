import ProjectsPageMain from "../components/site/ProjectsPageMain";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import PageContent from "../layouts/PageContent";
import BottomContact from "../components/site/BottomContact";
import CategoryProducts from "../components/site/CategoryProducts";
import ProductSlider from "../components/site/ProductSlider";

function CategoryProductsPage() {
  return (
    <PageContent>
      <Header />
      <CategoryProducts />
      <ProductSlider />
      <BottomContact />
      <Footer />
    </PageContent>
  );
}

export default CategoryProductsPage;
