import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Loader2, Save, Trash2 } from "lucide-react";
import { showSuccess, showError, showWarning, showConfirm } from "../../utils/toast";

function MapSettings() {
  const [iframeUrl, setIframeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasMap, setHasMap] = useState(false);

  // Sayfa yüklendiğinde mevcut haritayı al
  useEffect(() => {
    setIsLoading(true);
    axiosInstance
      .get("/map-settings")
      .then((res) => {
        if (res.status === 204 || !res.data) {
          setHasMap(false);
          setIframeUrl("");
        } else {
          setHasMap(true);
          setIframeUrl(res.data.iframeUrl);
        }
      })
      .catch((err) => {
        console.error("Map settings alınamadı:", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Kaydet (create or update)
  const handleSave = () => {
    if (!iframeUrl.trim()) {
      showWarning("Lütfen geçerli bir iframe URL girin.");
      return;
    }

    setIsLoading(true);
    axiosInstance
      .post("/map-settings", { iframeUrl })
      .then(() => {
        showSuccess("Harita ayarı başarıyla kaydedildi!");
        setHasMap(true);
      })
      .catch((err) => {
        console.error("Kaydedilemedi:", err);
        showError("Bir hata oluştu!");
      })
      .finally(() => setIsLoading(false));
  };

  // Sil
  const handleDelete = async () => {
    const confirmed = await showConfirm("Harita ayarını silmek istediğinize emin misiniz?");
    if (!confirmed) return;

    setIsLoading(true);
    axiosInstance
      .delete("/map-settings")
      .then(() => {
        setIframeUrl("");
        setHasMap(false);
        showSuccess("Harita ayarı başarıyla silindi!");
      })
      .catch((err) => {
        console.error("Silinemedi:", err);
        showError("Silme işlemi başarısız oldu!");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 w-full max-w-3xl mt-6 md:mt-10">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">Harita Ayarları</h2>

      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm md:text-base">
          <Loader2 className="animate-spin w-4 h-4 md:w-5 md:h-5" /> Yükleniyor...
        </div>
      ) : (
        <>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm md:text-base">
            Google Maps iframe URL
          </label>
          <textarea
            value={iframeUrl}
            onChange={(e) => setIframeUrl(e.target.value)}
            rows={4}
            placeholder="Google Maps iframe kodunu buraya yapıştırın"
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base whitespace-pre-line"
          />

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-4 md:mt-6">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-3 md:px-4 py-2 rounded-md font-medium transition-all disabled:opacity-50 text-sm md:text-base"
            >
              <Save size={16} className="md:w-5 md:h-5" />
              {hasMap ? "Güncelle" : "Kaydet"}
            </button>

            {hasMap && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-3 md:px-4 py-2 rounded-md font-medium transition-all disabled:opacity-50 text-sm md:text-base"
              >
                <Trash2 size={16} className="md:w-5 md:h-5" />
                Sil
              </button>
            )}
          </div>

          {/* Harita önizleme */}
          {iframeUrl && (
            <div className="mt-6 md:mt-8">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3 text-sm md:text-base">
                Harita Önizleme:
              </h3>
              <iframe
                src={iframeUrl}
                className="w-full h-[300px] md:h-[400px] rounded-lg shadow"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MapSettings;
