import { useEffect, useState } from "react";

const DashboardStats = () => {
  const [stats, setStats] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    total: 0,
  });

  useEffect(() => {
    fetch("http://localhost:8080/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Veri alınamadı:", err));
  }, []);

  const cards = [
    { title: "Günlük Ziyaret", value: stats.daily, color: "blue" },
    { title: "Haftalık Ziyaret", value: stats.weekly, color: "green" },
    { title: "Aylık Ziyaret", value: stats.monthly, color: "purple" },
    { title: "Toplam Ziyaret", value: stats.total, color: "orange" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-transform hover:scale-105 text-center"
        >
          <p
            className={`text-${card.color}-600 dark:text-${card.color}-400 text-3xl font-bold`}
          >
            {card.value}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {card.title}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
