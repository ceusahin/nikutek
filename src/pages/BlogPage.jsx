import BlogPageMain from "../components/site/BlogPageMain";
import BottomContact from "../components/site/BottomContact";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import PageContent from "../layouts/PageContent";
import ProductSlider from "../components/site/ProductSlider";

function BlogPage() {
  return (
    <PageContent>
      <Header />
      <BlogPageMain />
      <ProductSlider />
      <BottomContact />
      <Footer />
    </PageContent>
  );
}

export default BlogPage;
