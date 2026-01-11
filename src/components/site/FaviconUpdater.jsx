import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

function FaviconUpdater() {
  const [faviconUrl, setFaviconUrl] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/favicon")
      .then((res) => setFaviconUrl(res.data?.imageUrl || null))
      .catch(() => setFaviconUrl(null));
  }, []);

  useEffect(() => {
    if (faviconUrl) {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      const url = new URL(faviconUrl);
      url.pathname = url.pathname.replace(
        "/upload/",
        "/upload/w_32,h_32,c_scale/"
      );
      url.searchParams.set("v", Date.now());
      link.href = url.toString();
    }
  }, [faviconUrl]);

  return null;
}

export default FaviconUpdater;
