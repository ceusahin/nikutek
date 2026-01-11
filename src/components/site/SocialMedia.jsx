import React, { useEffect, useState } from "react";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faWhatsapp,
  faTwitter,
  faTelegramPlane,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import axiosInstance from "../../api/axiosInstance";

const iconMap = {
  facebook: faFacebookF,
  instagram: faInstagram,
  whatsapp: faWhatsapp,
  twitter: faTwitter,
  telegram: faTelegramPlane,
  linkedin: faLinkedinIn,
};

const platformClasses = {
  facebook: "text-white hover:bg-blue-700 hover:text-white",
  instagram:
    "text-white hover:bg-[linear-gradient(45deg,#f58529,#dd2a7b,#8134af,#515bd4)] hover:text-white",
  whatsapp: " text-white hover:bg-green-700 hover:text-white",
  twitter: " text-white hover:bg-blue-500 hover:text-white",
  telegram: "text-white hover:bg-blue-500 hover:text-white",
  linkedin: "text-white hover:bg-blue-600 hover:text-white",
};

function SocialMedia() {
  const [buttons, setButtons] = useState([]);
  const refs = React.useRef({});

  useEffect(() => {
    axiosInstance.get("/social-media").then((res) => {
      const dataWithClasses = res.data
        .filter((item) => item.visible)
        .map((item) => ({
          ...item,
          icon: iconMap[item.platform],
          className:
            platformClasses[item.platform] ||
            "border border-gray-500 bg-gray-400 text-white",
          tooltip:
            item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
        }));
      setButtons(dataWithClasses);
    });
  }, []);

  useEffect(() => {
    buttons.forEach(({ platform, tooltip }) => {
      if (refs.current[platform]) {
        tippy(refs.current[platform], {
          content: tooltip,
          animation: "fade",
          delay: [200, 200],
          placement: platform === "telegram" ? "left-start" : "top",
        });
      }
    });
  }, [buttons]);

  if (buttons.length === 0) return null;

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col h-25 xl:h-55 flex-wrap gap-4">
        {buttons.map(({ platform, icon, className, url }) => (
          <a
            key={platform}
            href={url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            ref={(el) => (refs.current[platform] = el)}
            id={platform}
            className={`w-12 h-12 rounded-full duration-500 transform hover:-translate-y-3 text-2xl flex items-center justify-center ${className}`}
          >
            <FontAwesomeIcon icon={icon} />
          </a>
        ))}
      </div>
    </div>
  );
}

export default SocialMedia;
