import React, { useEffect, useState } from 'react';
import { AlertTriangle, LogOut, RefreshCw } from 'lucide-react';
import useLanguage from '../../hooks/useLanguage';

const AutoLogoutWarning = ({ remainingSeconds, onStayLoggedIn, onLogout }) => {
  console.log('🎨 AutoLogoutWarning component render oldu!');
  console.log('⏱️ Remaining seconds:', remainingSeconds);
  
  const { language } = useLanguage();
  const [seconds, setSeconds] = useState(remainingSeconds);

  useEffect(() => {
    setSeconds(remainingSeconds);
  }, [remainingSeconds]);

  useEffect(() => {
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-yellow-500 dark:border-yellow-600 animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {language === 'tr' ? 'Oturum Zaman Aşımı' : 'Session Timeout'}
              </h3>
              <p className="text-yellow-100 text-sm">
                {language === 'tr' ? 'Hareketsizlik tespit edildi' : 'Inactivity detected'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              {/* Circular Progress */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-yellow-500 transition-all duration-1000"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 56}`,
                    strokeDashoffset: `${2 * Math.PI * 56 * (1 - seconds / remainingSeconds)}`,
                  }}
                />
              </svg>
              {/* Countdown Number */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-800 dark:text-white">
                    {seconds}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'tr' ? 'saniye' : 'seconds'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <p className="text-center text-sm text-gray-700 dark:text-gray-300">
              {language === 'tr'
                ? `${seconds} saniye içinde otomatik olarak çıkış yapılacak. Devam etmek için aşağıdaki butona tıklayın.`
                : `You will be automatically logged out in ${seconds} seconds. Click below to continue.`}
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onStayLoggedIn}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <RefreshCw className="w-5 h-5" />
            {language === 'tr' ? 'Oturumu Devam Ettir' : 'Stay Logged In'}
          </button>
          <button
            onClick={onLogout}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {language === 'tr' ? 'Çıkış Yap' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoLogoutWarning;

