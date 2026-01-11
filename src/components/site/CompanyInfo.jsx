import { Phone, Clock, Mail, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";
import renderHTML from "../../utils/renderHTML";

const iconsMap = {
  PHONE: Phone,
  EMAIL: Mail,
  WORK_HOURS: Clock,
  ADDRESS: MapPin,
};

function CompanyInfo() {
  const { language } = useLanguage();
  const [contactInfo, setContactInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/contact-info")
      .then((res) => {
        const visibleItems = res.data.filter((item) => item.isActive);
        setContactInfo(visibleItems);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Contact info alınamadı:", err);
        setContactInfo([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-10">{language === "tr" ? "Yükleniyor..." : "Loading..."}</div>;
  if (!contactInfo.length)
    return <div className="text-center py-10">{language === "tr" ? "Veri bulunamadı." : "Data not found."}</div>;

  return (
    <div className="text-[#343434] w-full mx-auto rounded-lg px-4 sm:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {contactInfo.map((item) => {
          const Icon = iconsMap[item.type] || MapPin;
          const translation =
            item.translations.find((t) => t.languageCode === language) ||
            item.translations[0];

          return (
            <div
              key={item.id}
              className="flex flex-col items-center justify-center text-center"
            >
              <Icon size={40} className="mb-3 sm:mb-4" />
              <h1 className="text-lg sm:text-xl font-extrabold mb-1 sm:mb-2 whitespace-pre-line">
                {translation.title}
              </h1>
              <div className="text-base sm:text-lg leading-snug">
                {renderHTML(translation.content)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CompanyInfo;
