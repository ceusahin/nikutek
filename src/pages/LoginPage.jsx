import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { showSuccess, showError } from "../utils/toast";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Kullanıcı adı ve şifre gerekli");
      showError("Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      const res = await axiosInstance.post("/auth/login", {
        username,
        password,
      });

      // Token'ı kaydet (response formatına göre ayarla)
      const token = res.data.token || res.data || res.data.accessToken;
      sessionStorage.setItem("adminToken", token);
      sessionStorage.setItem("adminUsername", username); // Username'i de kaydet

      // Başarılı giriş toastı
      showSuccess(`Hoş geldiniz, ${username}! 👋`);
      
      // Biraz gecikme ile yönlendir (toast'ın görünmesi için)
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (err) {
      console.error("Login error:", err);
      setError("Kullanıcı adı veya şifre yanlış");
      showError("Giriş başarısız! Lütfen bilgilerinizi kontrol edin.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col lg:flex-row">
      {/* Sol Taraf - Login Formu */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Paneli
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Hesabınıza giriş yapın
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Kullanıcı adınızı girin"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Şifrenizi girin"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-red-800 text-sm font-medium">
                      {error}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Giriş Yap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Taraf - Büyük Logo */}
      <div className="flex-1 items-center justify-center p-4 sm:p-6 lg:p-8 relative hidden lg:flex">
        <div className="text-center">
          <div className="w-64 h-64 xl:w-80 xl:h-80 bg-black/60 dark:bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center shadow-2xl border border-white/30 dark:border-gray-600/30 mb-8">
            <img
              src="/images/nikutek.png"
              alt="Logo"
              className="w-48 h-48 xl:w-64 xl:h-64 p-4 xl:p-6 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Alt Kısım - Logo */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl p-3 sm:p-4 shadow-lg border border-white/20 dark:border-gray-700/20 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-10">
          <img
            src="/images/brsm-p-logo.webp"
            alt="Logo"
            className="h-8 sm:h-10 lg:h-12 object-contain"
          />
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white text-center">
            BRSM Yönetim Paneli
          </h2>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
