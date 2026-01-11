import React, { useContext } from "react";
import "../App.css";
import { ThemeContext } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <label className="relative inline-flex items-center w-14 h-7 select-none cursor-pointer group">
      <input
        type="checkbox"
        checked={theme === "dark"}
        onChange={toggleTheme}
        className="sr-only peer"
      />

      {/* Background Track */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-gray-600 dark:to-gray-800 rounded-full transition-all duration-300 peer-checked:from-gray-600 peer-checked:to-gray-800 shadow-inner"></div>

      {/* Slider Ball */}
      <div className="absolute left-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 peer-checked:translate-x-7 flex items-center justify-center group-hover:scale-110">
        {/* Sun Icon */}
        <svg 
          className={`w-4 h-4 text-yellow-500 transition-all duration-300 ${theme === "dark" ? "opacity-0 scale-0" : "opacity-100 scale-100"}`}
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        
        {/* Moon Icon */}
        <svg 
          className={`absolute w-4 h-4 text-gray-600 transition-all duration-300 ${theme === "dark" ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
    </label>
  );
}
