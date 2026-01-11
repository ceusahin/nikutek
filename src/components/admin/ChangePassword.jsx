import React, { useState } from "react";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [loading, setLoading] = useState(false);

  const username = "admin";

  const handleChange = async () => {
    // Form validasyonu
    if (!newPassword.trim()) {
      setMessage("Yeni şifre gerekli");
      setMessageType("error");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Şifre en az 6 karakter olmalıdır");
      setMessageType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Şifreler eşleşmiyor");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axiosInstance.post("/admin/change-password", {
        username,
        newPassword,
      });
      setMessage(res.data || "Şifre başarıyla değiştirildi");
      setMessageType("success");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage("Şifre değiştirilemedi");
      setMessageType("error");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleChange();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 md:p-6 mb-6 md:mb-10">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
            Şifre Değiştir
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
          Kullanıcı:{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {username}
          </span>
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Yeni Şifre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Yeni Şifre
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Yeni şifrenizi girin"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Şifre Onayı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Şifre Onayı
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Şifrenizi tekrar girin"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Şifre Güçlülük Göstergesi */}
        {newPassword && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
              <span>Şifre güçlülüğü:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`w-2 h-2 rounded-full ${
                      newPassword.length >= level * 1.5
                        ? "bg-green-500"
                        : "bg-gray-200 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {newPassword.length < 6 && "En az 6 karakter gerekli"}
              {newPassword.length >= 6 &&
                newPassword.length < 8 &&
                "Orta güçlülük"}
              {newPassword.length >= 8 && "Güçlü şifre"}
            </div>
          </div>
        )}

        {/* Mesaj */}
        {message && (
          <div
            className={`p-3 md:p-4 rounded-lg border ${
              messageType === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {messageType === "success" ? (
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 dark:text-red-400" />
              )}
              <span
                className={`text-xs md:text-sm font-medium ${
                  messageType === "success" ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"
                }`}
              >
                {message}
              </span>
            </div>
          </div>
        )}

        {/* Kaydet Butonu */}
        <button
          onClick={handleChange}
          disabled={loading || !newPassword || !confirmPassword}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Kaydediliyor...</span>
            </div>
          ) : (
            "Şifreyi Değiştir"
          )}
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
