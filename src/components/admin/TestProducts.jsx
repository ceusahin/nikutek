import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const TestProducts = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get("/products/main");
        console.log("Backend response:", res.data);
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetch();
  }, []);

  return (
    <div>
      <h2>Ürün Testi</h2>
      {Array.isArray(data) ? (
        <p>Array olarak geliyor. Eleman sayısı: {data.length}</p>
      ) : data ? (
        <p>Array değil! Tip: {typeof data}</p>
      ) : (
        <p>Yükleniyor...</p>
      )}
    </div>
  );
};

export default TestProducts;
