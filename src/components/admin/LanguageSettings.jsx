import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { showSuccess, showError, showConfirm } from "../../utils/toast";

const LanguageSettings = () => {
  const [languages, setLanguages] = useState([]);
  const [newLang, setNewLang] = useState({ code: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1️⃣ Dilleri listele
  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/languages");
      setLanguages(res.data);
    } catch (err) {
      console.error(err);
      setError("Dilleri getirme hatası");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  // 2️⃣ Yeni dil ekle
  const handleAddLanguage = async () => {
    if (!newLang.code || !newLang.name) {
      setError("Hem code hem name girilmelidir");
      showError("Lütfen tüm alanları doldurun!");
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.post("/languages/add", newLang);
      setLanguages((prev) => [...prev, res.data]);
      setNewLang({ code: "", name: "" });
      setError("");
      showSuccess("Dil başarıyla eklendi!");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Dil ekleme hatası";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 3️⃣ Dil sil
  const handleDelete = async (id) => {
    const confirmed = await showConfirm("Bu dili silmek istediğinize emin misiniz?");
    if (!confirmed) return;

    try {
      setLoading(true);
      await axiosInstance.delete(`/languages/${id}`);
      setLanguages((prev) => prev.filter((lang) => lang.id !== id));
      showSuccess("Dil başarıyla silindi!");
    } catch (err) {
      console.error(err);
      setError("Dil silme hatası");
      showError("Dil silinirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Diller</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Yeni dil ekleme */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Code (ör: tr)"
          value={newLang.code}
          onChange={(e) => setNewLang({ ...newLang, code: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Name (ör: Türkçe)"
          value={newLang.name}
          onChange={(e) => setNewLang({ ...newLang, name: e.target.value })}
          className="border p-2 rounded"
        />
        <button
          onClick={handleAddLanguage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Ekle
        </button>
      </div>

      {/* Dilleri listeleme */}
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">Code</th>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((lang) => (
              <tr key={lang.id}>
                <td className="border p-2">{lang.id}</td>
                <td className="border p-2">{lang.code}</td>
                <td className="border p-2">{lang.name}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleDelete(lang.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LanguageSettings;
