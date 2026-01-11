import { Route, Routes } from "react-router";
import "./App.css";
import MainPage from "./pages/MainPage";
import Panel from "./pages/Panel";
import AboutUs from "./pages/AboutUs";
import ServicePage from "./pages/ServicePage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import BlogPage from "./pages/BlogPage";
import ReferencesPage from "./pages/ReferencesPage";
import ContactPage from "./pages/ContactPage";
import FaviconUpdater from "./components/site/FaviconUpdater";
import SeoMetaUpdater from "./components/site/SeoMetaUpdater";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import LoginPage from "./pages/LoginPage";
import AdminRoute from "./components/admin/AdminRoute";
import useVisitTracker from "./hooks/useVisitTracker";
import ScrollToTop from "./components/ScrollToTop";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  useVisitTracker();
  const appType = import.meta.env.VITE_APP_TYPE || "site"; // Default olarak "site"

  // Path haritaları
  const paths = {
    tr: {
      about: "hakkimizda",
      services: "teknolojilerimiz",
      serviceDetail: "teknolojilerimiz/:slug",
      projects: "urunlerimiz",
      projectDetail: "urunlerimiz/:slug",
      category: "urunlerimiz/kategori/:slug",
      blog: "blog",
      refs: "referanslarimiz",
      contact: "iletisim",
    },
    en: {
      about: "about",
      services: "technologies",
      serviceDetail: "technologies/:slug",
      projects: "products",
      projectDetail: "products/:slug",
      category: "products/category/:slug",
      blog: "blog",
      refs: "references",
      contact: "contact",
    },
  };

  const pTr = paths.tr;
  const pEn = paths.en;

  return (
    <>
      <ScrollToTop />
      <FaviconUpdater />
      <SeoMetaUpdater />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Routes>
        {appType === "site" && (
          <>
            {/* Anasayfa */}
            <Route path="/" element={<MainPage />} />
            
            {/* Türkçe Route'lar */}
            <Route path={`/${pTr.about}`} element={<AboutUs />} />
            <Route path={`/${pTr.services}`} element={<ServicePage />} />
            <Route path={`/${pTr.serviceDetail}`} element={<ServiceDetailPage />} />
            <Route path={`/${pTr.projects}`} element={<ProjectsPage />} />
            <Route path={`/${pTr.projectDetail}`} element={<ProjectDetailPage />} />
            <Route path={`/${pTr.category}`} element={<CategoryProductsPage />} />
            <Route path={`/${pTr.blog}`} element={<BlogPage />} />
            <Route path={`/${pTr.refs}`} element={<ReferencesPage />} />
            <Route path={`/${pTr.contact}`} element={<ContactPage />} />
            
            {/* İngilizce Route'lar */}
            <Route path={`/${pEn.about}`} element={<AboutUs />} />
            <Route path={`/${pEn.services}`} element={<ServicePage />} />
            <Route path={`/${pEn.serviceDetail}`} element={<ServiceDetailPage />} />
            <Route path={`/${pEn.projects}`} element={<ProjectsPage />} />
            <Route path={`/${pEn.projectDetail}`} element={<ProjectDetailPage />} />
            <Route path={`/${pEn.category}`} element={<CategoryProductsPage />} />
            <Route path={`/${pEn.blog}`} element={<BlogPage />} />
            <Route path={`/${pEn.refs}`} element={<ReferencesPage />} />
            <Route path={`/${pEn.contact}`} element={<ContactPage />} />
          </>
        )}

        {appType === "admin" && (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <AdminRoute>
                  <Panel />
                </AdminRoute>
              }
            />
          </>
        )}
      </Routes>
    </>
  );
}

export default App;


// import { Route, Routes } from "react-router";
// import "./App.css";
// import MainPage from "./pages/MainPage";
// import Panel from "./pages/Panel";
// import AboutUs from "./pages/AboutUs";
// import ServicePage from "./pages/ServicePage";
// import ServiceDetailPage from "./pages/ServiceDetailPage";
// import ProjectsPage from "./pages/ProjectsPage";
// import ProjectDetailPage from "./pages/ProjectDetailPage";
// import BlogPage from "./pages/BlogPage";
// import ReferencesPage from "./pages/ReferencesPage";
// import ContactPage from "./pages/ContactPage";
// import FaviconUpdater from "./components/site/FaviconUpdater";
// import SeoMetaUpdater from "./components/site/SeoMetaUpdater";
// import CategoryProductsPage from "./pages/CategoryProductsPage";
// import LoginPage from "./pages/LoginPage";
// import AdminRoute from "./components/admin/AdminRoute";
// import useVisitTracker from "./hooks/useVisitTracker";
// function App() {
//   useVisitTracker();
//   return (
//     <>
//       {" "}
//       <FaviconUpdater />
//       <SeoMetaUpdater />{" "}
//       <Routes>
//         {" "}
//         <Route path="/" element={<MainPage />} />{" "}
//         <Route path="/hakkimizda" element={<AboutUs />} />{" "}
//         <Route path="/teknolojilerimiz" element={<ServicePage />} />{" "}
//         <Route path="/teknolojilerimiz/:slug" element={<ServiceDetailPage />} />{" "}
//         <Route path="/urunlerimiz" element={<ProjectsPage />} />{" "}
//         <Route path="/urunlerimiz/:slug" element={<ProjectDetailPage />} />{" "}
//         <Route
//           path="/urunlerimiz/kategori/:slug"
//           element={<CategoryProductsPage />}
//         />{" "}
//         <Route path="/blog" element={<BlogPage />} />{" "}
//         <Route path="/referanslarimiz" element={<ReferencesPage />} />{" "}
//         <Route path="/iletisim" element={<ContactPage />} />{" "}
//         <Route path="/admin/login" element={<LoginPage />} />{" "}
//         <Route
//           path="/admin"
//           element={
//             <AdminRoute>
//               <Panel />
//             </AdminRoute>
//           }
//         />
//       </Routes>
//     </>
//   );
// }
// export default App;

