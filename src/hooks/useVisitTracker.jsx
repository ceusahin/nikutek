import { useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const useVisitTracker = () => {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Her sayfa yüklendiğinde ziyaret kaydı yap
        await axiosInstance.post("/stats/add");
        // console.log('Ziyaret kaydı başarıyla eklendi');
      } catch (error) {
        console.error("Ziyaret kaydı eklenirken hata oluştu:", error);
      }
    };

    trackVisit();
  }, []);
};

export default useVisitTracker;
