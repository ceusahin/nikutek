import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";
import { showSuccess, showError } from "../../utils/toast";
import {
  Plus,
  Trash2,
  Save,
  Building2,
  Briefcase,
  Search,
  Edit3,
  Check,
  X,
} from "lucide-react";

const ReferencesSettings = () => {
  const { language } = useLanguage();
  const [industries, setIndustries] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  const [industryName, setIndustryName] = useState("");
  const [newIndustryName, setNewIndustryName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCompany, setEditingCompany] = useState(null);
  const [editingCompanyName, setEditingCompanyName] = useState("");

  // Endüstrileri fetch et
  const fetchIndustries = useCallback(async () => {
    try {
      // Normal endpoint kullan (artık şirket filtresi yok, tüm endüstriler geliyor)
      const res = await axiosInstance.get(`/references/${language}`);
      
      console.log("API Response:", res.data);
      console.log("Total industries:", res.data?.length);
      
      // Son eklenenleri en üste almak için ID'ye göre ters sırala (en yüksek ID = en yeni)
      const sortedIndustries = Array.isArray(res.data) 
        ? [...res.data].sort((a, b) => (b.id || 0) - (a.id || 0))
        : res.data;
      
      setIndustries(sortedIndustries);
      console.log("Sorted industries:", sortedIndustries);
    } catch (err) {
      console.error("Error fetching industries:", err);
      showError("Endüstriler yüklenirken hata oluştu!");
    }
  }, [language]);

  useEffect(() => {
    fetchIndustries();
  }, [fetchIndustries]);

  // Endüstri seç
  const selectIndustry = (industry) => {
    setSelectedIndustry(industry);
    setIndustryName(industry.name);
  };

  // Industry translation kaydet
  const saveIndustryTranslation = async () => {
    if (!selectedIndustry) return;
    try {
      await axiosInstance.post("/references/industry-translation", {
        industryId: selectedIndustry.id,
        languageCode: language,
        name: industryName,
      });

      // Lokal state güncelle
      setIndustries((prev) =>
        prev.map((ind) =>
          ind.id === selectedIndustry.id ? { ...ind, name: industryName } : ind
        )
      );
      setSelectedIndustry((prev) => ({ ...prev, name: industryName }));

      // ✅ Listeyi backend'den tazele
      await fetchIndustries();

      showSuccess("Endüstri ismi başarıyla kaydedildi!");
    } catch (err) {
      console.error(err);
      showError("Hata oluştu!");
    }
  };

  // Endüstri sil
  const deleteIndustry = async () => {
    if (!selectedIndustry) return;
    try {
      await axiosInstance.delete(`/references/industry/${selectedIndustry.id}`);

      setIndustries((prev) =>
        prev.filter((ind) => ind.id !== selectedIndustry.id)
      );
      setSelectedIndustry(null);
      setIndustryName("");
      showSuccess("Endüstri başarıyla silindi!");
    } catch (err) {
      console.error(err);
      showError("Hata oluştu!");
    }
  };

  // Yeni endüstri ekle
  const addIndustry = async () => {
    if (!newIndustryName.trim()) return;
    try {
      const res = await axiosInstance.post("/references/industry");
      const newIndustry = res.data;
      console.log("Yeni endüstri oluşturuldu:", newIndustry);

      // Translation ekle
      const translation = await axiosInstance.post(
        "/references/industry-translation",
        {
          industryId: newIndustry.id,
          languageCode: language,
          name: newIndustryName,
        }
      );
      console.log("Translation eklendi:", translation.data);

      newIndustry.name = translation.data?.name || newIndustryName;
      newIndustry.companies = [];

      setNewIndustryName("");
      
      // Önce yeni endüstriyi state'e ekle
      setIndustries((prev) => {
        const updated = [newIndustry, ...prev];
        // ID'ye göre ters sırala (en yeni en üstte)
        return updated.sort((a, b) => (b.id || 0) - (a.id || 0));
      });
      
      // Sonra API'den taze veriyi al (admin endpoint kullan)
      await fetchIndustries();
      
      showSuccess("Yeni endüstri başarıyla eklendi!");
    } catch (err) {
      console.error("Endüstri ekleme hatası:", err);
      showError("Hata oluştu!");
    }
  };

  // Yeni company ekle
  const addCompany = async () => {
    if (!selectedIndustry || !companyName.trim()) return;
    try {
      const res = await axiosInstance.post("/references/company", {
        industryId: selectedIndustry.id,
        name: companyName,
      });

      const newCompany = {
        id: res.data.id,
        name: res.data.name || companyName,
      };

      setIndustries((prev) =>
        prev.map((ind) =>
          ind.id === selectedIndustry.id
            ? { ...ind, companies: [...ind.companies, newCompany] }
            : ind
        )
      );

      setSelectedIndustry((prev) => ({
        ...prev,
        companies: [...prev.companies, newCompany],
      }));

      setCompanyName("");
    } catch (err) {
      console.error(err);
      showError("Hata oluştu!");
    }
  };

  // Company sil
  const deleteCompany = async (id) => {
    try {
      await axiosInstance.delete(`/references/company/${id}`);
      setIndustries((prev) =>
        prev.map((ind) =>
          ind.id === selectedIndustry.id
            ? {
                ...ind,
                companies: ind.companies.filter((c) => c.id !== id),
              }
            : ind
        )
      );
      setSelectedIndustry((prev) => ({
        ...prev,
        companies: prev.companies.filter((c) => c.id !== id),
      }));
      showSuccess("Şirket başarıyla silindi!");
    } catch (err) {
      console.error(err);
      showError("Hata oluştu!");
    }
  };

  // Company düzenleme başlat
  const startEditingCompany = (company) => {
    setEditingCompany(company.id);
    setEditingCompanyName(company.name);
  };

  // Company düzenleme iptal
  const cancelEditingCompany = () => {
    setEditingCompany(null);
    setEditingCompanyName("");
  };

  // Company düzenleme kaydet
  const saveEditingCompany = async () => {
    if (!editingCompany || !editingCompanyName.trim()) return;
    try {
      await axiosInstance.put(`/references/company/${editingCompany}`, {
        name: editingCompanyName,
      });

      setIndustries((prev) =>
        prev.map((ind) =>
          ind.id === selectedIndustry.id
            ? {
                ...ind,
                companies: ind.companies.map((c) =>
                  c.id === editingCompany
                    ? { ...c, name: editingCompanyName }
                    : c
                ),
              }
            : ind
        )
      );

      setSelectedIndustry((prev) => ({
        ...prev,
        companies: prev.companies.map((c) =>
          c.id === editingCompany ? { ...c, name: editingCompanyName } : c
        ),
      }));

      setEditingCompany(null);
      setEditingCompanyName("");
      showSuccess("Şirket bilgileri güncellendi!");
    } catch (err) {
      console.error(err);
      showError("Hata oluştu!");
    }
  };

  // Filtrelenmiş endüstriler
  const filteredIndustries = industries.filter(
    (industry) =>
      industry?.name &&
      industry.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="min-h-screen dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Referans Yönetimi
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Endüstrileri ve şirketleri yönetin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-slate-800 rounded-lg px-3 md:px-4 py-2 shadow-sm border border-gray-200 dark:border-slate-700">
              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Toplam Endüstri:
              </span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {industries.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Sol panel: Endüstriler */}
        <div className="lg:col-span-4 col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm md:text-base">Endüstriler</h3>
                  <p className="text-white/80 text-xs md:text-sm">Sektör kategorileri</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-3 md:p-4 border-b border-gray-200 dark:border-slate-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Endüstri ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
                <div className="absolute left-3 top-2.5">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Industries List */}
            <div className="p-3 md:p-4 max-h-[300px] md:max-h-[400px] overflow-y-auto">
              {filteredIndustries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    {searchTerm
                      ? "Arama sonucu bulunamadı"
                      : "Henüz endüstri yok"}
                  </p>
                  {!searchTerm && (
                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                      İlk endüstriyi ekleyin
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredIndustries.map((industry) => (
                    <div
                      key={industry.id}
                      className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedIndustry?.id === industry.id
                          ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 shadow-sm"
                          : "hover:bg-gray-50 dark:hover:bg-slate-700 border border-transparent"
                      }`}
                      onClick={() => selectIndustry(industry)}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          selectedIndustry?.id === industry.id
                            ? "bg-blue-500"
                            : "bg-gray-400"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {industry.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {industry.companies?.length || 0} şirket
                        </p>
                      </div>
                      {selectedIndustry?.id === industry.id && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit3 className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Industry */}
            <div className="p-3 md:p-4 border-t border-gray-200 dark:border-slate-700">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Yeni endüstri adı"
                  value={newIndustryName}
                  onChange={(e) => setNewIndustryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={addIndustry}
                  disabled={!newIndustryName.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg text-sm transition-colors"
                >
                  <Plus size={16} />
                  Endüstri Ekle
                </button>
              </div>
            </div>

            {/* Edit Industry */}
            {selectedIndustry && (
              <div className="p-3 md:p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                <h4 className="text-xs md:text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Endüstri Düzenle
                </h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={industryName}
                    onChange={(e) => setIndustryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveIndustryTranslation}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
                    >
                      <Save size={14} />
                      Kaydet
                    </button>
                    <button
                      onClick={deleteIndustry}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
                    >
                      <Trash2 size={14} />
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sağ panel: Şirketler */}
        <div className="lg:col-span-8 col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm md:text-base">Şirketler</h3>
                  <p className="text-white/80 text-xs md:text-sm">
                    {selectedIndustry
                      ? `${selectedIndustry.name} sektörü`
                      : "Endüstri seçin"}
                  </p>
                </div>
              </div>
            </div>

            {selectedIndustry ? (
              <div className="p-4 md:p-6">
                {/* Companies List */}
                <div className="mb-4 md:mb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                      Şirket Listesi
                    </h4>
                    <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      {selectedIndustry.companies?.length || 0} şirket
                    </span>
                  </div>

                  {selectedIndustry.companies?.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 mb-2">
                        Henüz şirket eklenmemiş
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">
                        İlk şirketi ekleyin
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] md:max-h-[400px] overflow-y-auto">
                      {selectedIndustry.companies.map((company) => (
                        <div
                          key={company.id}
                          className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 transition-colors"
                        >
                          {editingCompany === company.id ? (
                            <div className="flex items-center gap-3 flex-1">
                              <input
                                type="text"
                                value={editingCompanyName}
                                onChange={(e) =>
                                  setEditingCompanyName(e.target.value)
                                }
                                className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                autoFocus
                              />
                              <button
                                onClick={saveEditingCompany}
                                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelEditingCompany}
                                className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                  <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">
                                    {company.name}
                                  </h5>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {selectedIndustry.name} sektörü
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditingCompany(company)}
                                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => deleteCompany(company.id)}
                                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Company */}
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4 md:pt-6">
                  <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
                    Yeni Şirket Ekle
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Şirket adını girin..."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={addCompany}
                      disabled={!companyName.trim()}
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium px-4 md:px-6 py-3 rounded-lg transition-colors w-full sm:w-auto"
                    >
                      <Plus size={16} />
                      Ekle
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Endüstri Seçin
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  Şirket eklemek için önce bir endüstri seçin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferencesSettings;
