import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import useLanguage from "../hooks/useLanguage";
import SocialMedia from "../components/site/SocialMedia";
import renderHTML from "../utils/renderHTML";

const Footer = () => {
  const [menus, setMenus] = useState([]);
  const [companyTitle, setCompanyTitle] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);
  const { language } = useLanguage();

  useEffect(() => {
    axiosInstance
      .get(`/footer-menu/${language}`)
      .then((res) => {
        // console.log("Footer menüleri:", res.data);
        setMenus(res.data);
      })
      .catch((err) => {
        console.error("Footer menüleri alınamadı:", err);
      });

    axiosInstance
      .get(`/company-info/${language}`)
      .then((res) => {
        // console.log("Şirket bilgisi:", res.data);
        setCompanyTitle(res.data.companyName);
        setCompanyDescription(res.data.companyDescription);
      })
      .catch((err) => {
        console.error("Şirket bilgisi alınamadı:", err);
      });

    axiosInstance
      .get("/logo")
      .then((res) => {
        setLogoUrl(res.data.imageUrl || res.data);
      })
      .catch((err) => {
        console.error("Logo alınamadı:", err);
      });
  }, [language]);

  return (
    <footer className="bg-black text-white py-10 px-6 md:px-16 lg:px-24 xl:px-54">
      <div className="flex flex-wrap justify-around gap-10">
        {/* Şirket Bilgileri + Sosyal Medya */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center sm:items-start max-w-xs sm:max-w-none text-center sm:text-left flex-shrink-0">
          <div>
            {logoUrl && (
              <img
                src={logoUrl}
                alt={language === "tr" ? "Şirket Logosu" : "Company Logo"}
                className="mb-4 w-36 sm:w-40 object-contain mx-auto sm:mx-0"
              />
            )}
            <h3 className="text-xl font-semibold mb-2">{companyTitle}</h3>
            <div className="text-white max-w-[280px] sm:max-w-[416px] mx-auto sm:mx-0">
              {renderHTML(companyDescription)}
            </div>
          </div>
          <div>
            <SocialMedia />
          </div>
        </div>

        {/* Menüler */}
        {menus.length === 0 && (
          <p className="text-gray-400 w-full text-center mt-6">
            {language === "tr" ? "Footer menüleri yükleniyor..." : "Loading footer menus..."}
          </p>
        )}

        {menus.map((menu) => (
          <div
            key={menu.id}
            className="text-center xl:text-left min-w-[150px] max-w-xs w-full sm:w-auto"
          >
            <h4 className="mb-8 font-semibold text-2xl">{menu.title}</h4>
            {menu.items && menu.items.length > 0 ? (
              <ul className="space-y-4">
                {menu.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      className="text-gray-300 hover:text-[#fdf001] transition"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">
                {language === "tr" ? "Bu menüye ait öğe bulunmamaktadır." : "No items found in this menu."}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 text-center text-sm text-gray-400">
        © {new Date().getFullYear()}{" "}
        <a
          href="https://wa.me/905310147630?text=Merhaba%20BRSM%20ekibi%2C%20creative%20production%20ve%20dijital%20hizmetleriniz%20hakk%C4%B1nda%20proje%20g%C3%B6r%C3%BC%C5%9Fmesi%20yapmak%20istiyorum."
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-500 hover:underline"
        >
          BRSM COMPANY{" "}
        </a>
        {language === "tr" ? "Tüm Hakları Saklıdır." : "All Rights Reserved."}
      </div>
    </footer>
  );
};

export default Footer;
