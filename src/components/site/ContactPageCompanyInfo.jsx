import { Phone, Clock, Mail, MapPin } from "lucide-react";
import ContactPageContactForm from "./ContactPageContactForm";
import FadeContent from "../../utils/FadeContent";
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

function ContactPageCompanyInfo() {
  const { language } = useLanguage();
  const [contactInfo, setContactInfo] = useState([]);
  const [mapUrl, setMapUrl] = useState(""); // ✅ Yeni: Dinamik harita URL'si
  const [isMapLoading, setIsMapLoading] = useState(true);

  // İletişim bilgilerini getir
  useEffect(() => {
    axiosInstance
      .get("/contact-info")
      .then((res) => {
        const activeItems = res.data.filter((item) => item.isActive);
        setContactInfo(activeItems);
      })
      .catch((err) => {
        console.error("Contact info alınamadı:", err);
        setContactInfo([]);
      });
  }, []);

  // ✅ Harita ayarını getir
  useEffect(() => {
    setIsMapLoading(true);
    axiosInstance
      .get("/map-settings")
      .then((res) => {
        if (res.data?.iframeUrl) {
          setMapUrl(res.data.iframeUrl);
        } else {
          setMapUrl("");
        }
      })
      .catch((err) => {
        console.error("Map settings alınamadı:", err);
      })
      .finally(() => setIsMapLoading(false));
  }, []);

  return (
    <FadeContent
      blur={false}
      duration={1000}
      easing="ease-out"
      initialOpacity={0}
    >
      <div className="text-[#343434] xl:mx-36 pt-32 md:pt-36 lg:pt-40 xl:pt-44 2xl:pt-48 px-4">
        {/* Başlık */}
        <div className="flex justify-center my-6 items-center text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold border-b-2 border-black pb-2">
            {language === "tr" ? "İLETİŞİM" : "CONTACT"}
          </h2>
        </div>

        {/* Form + Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* Form */}
          <div className="w-full">
            <ContactPageContactForm />
          </div>

          {/* İletişim Bilgileri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {contactInfo.map((item) => {
              const Icon = iconsMap[item.type] || MapPin;
              const translation =
                item.translations.find((t) => t.languageCode === language) ||
                item.translations[0];

              return (
                <div
                  key={item.id}
                  className="flex flex-col items-center text-center gap-4 justify-center p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-gray-50"
                >
                  <Icon size={50} className="text-black" />
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-black whitespace-pre-line">
                      {translation.title || item.type}
                    </h1>
                    <div className="text-lg md:text-xl text-gray-700 break-words whitespace-pre-line">
                      {renderHTML(translation.content)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ✅ Harita */}
        <div className="w-full">
          {isMapLoading ? (
            <p className="text-center text-gray-500 py-10">
              {language === "tr" ? "Harita yükleniyor..." : "Loading map..."}
            </p>
          ) : mapUrl ? (
            <iframe
              className="mt-10 w-full h-[400px] sm:h-[450px] rounded-lg shadow-lg"
              src={mapUrl}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          ) : (
            <p className="text-center text-gray-500 py-10">
              {language === "tr" ? "Henüz harita ayarı yapılmamış." : "Map settings have not been configured yet."}
            </p>
          )}
        </div>
      </div>
    </FadeContent>
  );
}

export default ContactPageCompanyInfo;
