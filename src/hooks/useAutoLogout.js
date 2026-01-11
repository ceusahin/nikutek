import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useAutoLogout = (timeout = 5 * 60 * 1000, warningTime = 30000) => { // 5 dakika timeout, 30 saniye uyarı
  const navigate = useNavigate();
  const logoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningSeconds, setWarningSeconds] = useState(warningTime / 1000);

  const logout = useCallback(() => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUsername');
    sessionStorage.removeItem('hasShownWelcome'); // Hoşgeldin flag'ini temizle
    setShowWarning(false);
    navigate('/login');
    // console.log('Otomatik çıkış yapıldı - Hareketsizlik süresi doldu');
  }, [navigate]);

  const resetTimer = useCallback(() => {
    // Warning'i kapat
    setShowWarning(false);
    
    // Mevcut timer'ları temizle
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Yeni timer'lar kur
    // Uyarı süresinden önce uyarı göster
    warningTimerRef.current = setTimeout(() => {
    //   console.log('⚠️ Otomatik çıkış uyarısı gösteriliyor!');
    //   console.log('🔔 showWarning state true olarak ayarlanıyor...');
      setShowWarning(true);
      setWarningSeconds(warningTime / 1000);
      // console.log('⏱️ Warning seconds:', warningTime / 1000);
    }, timeout - warningTime); // Örnek: 4.5 dakika sonra uyar

    // Timeout süresi sonra logout
    logoutTimerRef.current = setTimeout(() => {
      logout();
    }, timeout);
  }, [logout, timeout, warningTime]);

  useEffect(() => {
    // İzlenecek olaylar
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Her olay için timer'ı sıfırla (sadece warning gösterilmiyorsa)
    const resetOnActivity = () => {
      if (!showWarning) {
        // console.log('🔄 Aktivite tespit edildi, timer sıfırlanıyor');
        resetTimer();
      } else {
        // console.log('⚠️ Warning gösteriliyor, aktivite göz ardı ediliyor');
      }
    };

    // Olayları dinle
    events.forEach((event) => {
      window.addEventListener(event, resetOnActivity);
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetOnActivity);
      });
    };
  }, [showWarning, resetTimer]);

  // İlk timer'ı başlatmak için ayrı useEffect
  useEffect(() => {
    // console.log('🚀 İlk timer başlatılıyor...');
    resetTimer();

    // Cleanup - component unmount olduğunda timer'ları temizle
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, []); // Sadece mount'ta bir kere çalış

  return {
    showWarning,
    warningSeconds,
    resetTimer,
    logout,
  };
};

export default useAutoLogout;

