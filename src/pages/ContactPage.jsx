import ContactPageCompanyInfo from "../components/site/ContactPageCompanyInfo";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import PageContent from "../layouts/PageContent";
import ProductSlider from "../components/site/ProductSlider";

function ContactPage() {
  return (
    <PageContent>
      <Header />
      <ContactPageCompanyInfo />
      <ProductSlider />
      <Footer />
    </PageContent>
  );
}

export default ContactPage;
