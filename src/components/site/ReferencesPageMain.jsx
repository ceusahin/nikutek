import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import FadeContent from "../../utils/FadeContent";
import useLanguage from "../../hooks/useLanguage";

const ReferencesPageMain = () => {
  const { language } = useLanguage();
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/references/${language}`);
        
        // Sadece seçilen dilde çevirisi olan endüstrileri göster (şirket filtresi yok)
        const filteredReferences = response.data.filter(
          (category) => 
            category.name && 
            category.name.trim() !== "" // Endüstri çevirisi varsa
        );
        
        setReferences(filteredReferences);
      } catch (err) {
        console.error("Referanslar alınamadı:", err);
        setError(language === "tr" ? "Veriler alınırken bir hata oluştu." : "An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReferences();
  }, [language]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-600 text-lg">{language === "tr" ? "Yükleniyor..." : "Loading..."}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-red-500 text-lg">{language === "tr" ? "Veriler alınırken bir hata oluştu." : "An error occurred while fetching data."}</p>
      </div>
    );
  }

  return (
    <FadeContent
      blur={false}
      duration={1000}
      easing="ease-out"
      initialOpacity={0}
    >
      <div className="container mx-auto px-4 pt-32 md:pt-36 lg:pt-40 xl:pt-44 2xl:pt-48 pb-12 md:pb-16 lg:pb-20">
        {/* Başlık */}
        <div className="flex justify-center mb-10 items-center text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold border-b-2 border-black pb-3">
            {language === "tr" ? "REFERANSLARIMIZ" : "OUR REFERENCES"}
          </h2>
        </div>

        {/* Kategoriler Grid (max 2 yan yana) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {references.length > 0 ? (
            references.map((category) => (
              <div
                key={category.id}
                className="border border-gray-300 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center bg-white hover:shadow-md transition-all duration-300"
              >
                {/* Kategori Adı */}
                <h3 className="text-2xl font-semibold text-black border-b border-gray-300 pb-2 mb-4">
                  {category.name}
                </h3>

                {/* Şirketler */}
                {category.companies.length > 0 ? (
                  <ul className="space-y-2">
                    {category.companies.map((company) => (
                      <li
                        key={company.id}
                        className="text-lg sm:text-xl font-medium text-black hover:text-[#fdf001] transition-colors duration-300"
                      >
                        {company.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">
                    {language === "tr" ? "Bu kategoride henüz şirket bulunmuyor." : "No companies in this category yet."}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-2">
              {language === "tr" ? "Henüz referans bulunamadı." : "No references found yet."}
            </p>
          )}
        </div>
      </div>
    </FadeContent>
  );
};

export default ReferencesPageMain;
