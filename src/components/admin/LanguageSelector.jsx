import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance"; // axiosInstance'ın yolu sana göre
import { useContext } from "react";
import LanguageContext from "../../contexts/LanguageContext";

function LanguageSelector() {
  const { language, setLanguage } = useContext(LanguageContext);
  const [languages, setLanguages] = useState([]);

  // Dilleri backend'den çek
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await axiosInstance.get("/languages");
        setLanguages(res.data); // Örn: [{ code: "tr", name: "Türkçe" }, { code: "en", name: "English" }]
      } catch (err) {
        console.error("Dil çekme hatası:", err);
      }
    };

    fetchLanguages();
  }, []);

  // Eğer language boşsa default olarak "tr" ata
  useEffect(() => {
    if (!language) {
      setLanguage("tr");
      localStorage.setItem("lang", "tr");
    }
  }, [language, setLanguage]);

  const handleChange = (e) => {
    setLanguage(e.target.value);
    localStorage.setItem("lang", e.target.value);
  };

  return (
    <div className="relative">
      <select
        value={language || "tr"}
        onChange={handleChange}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="text-gray-900 dark:text-white">
            {lang.name}
          </option>
        ))}
      </select>
      
      {/* Custom Dropdown Arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export default LanguageSelector;
