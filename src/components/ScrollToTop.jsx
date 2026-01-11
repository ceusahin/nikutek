import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Her route değiştiğinde sayfanın en üstüne scroll yapan component
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Route değiştiğinde en üste scroll yap
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // Smooth scroll animasyonu
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;

