import React from "react";

/**
 * Basit markdown benzeri formatlamayı React elementlerine çevirir
 * Desteklenen formatlar:
 * - *text* → <strong>text</strong> (bold)
 * - **text** → <strong>text</strong> (bold - alternatif)
 * - \n → <br /> (satır sonu)
 * 
 * @param {string} text - Formatlanacak metin
 * @returns {React.ReactNode} - Formatlanmış React elementi
 */
export const formatText = (text) => {
  if (!text) return null;

  // Satır sonlarını split et
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    if (!line.trim()) {
      // Boş satırları <br /> olarak göster
      return React.createElement('br', { key: lineIndex });
    }

    const parts = [];
    let currentIndex = 0;
    
    // Önce **text** pattern'ini kontrol et (daha uzun olan önce)
    const doubleStarRegex = /\*\*(.+?)\*\*/g;
    const singleStarRegex = /\*(.+?)\*/g;
    
    // Tüm match'leri bul ve index'e göre sırala
    const allMatches = [];
    
    // **text** pattern'lerini bul
    let match;
    while ((match = doubleStarRegex.exec(line)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'strong',
        content: match[1],
        fullMatch: match[0]
      });
    }
    
    // *text* pattern'lerini bul (sadece çift yıldız içermeyenler)
    while ((match = singleStarRegex.exec(line)) !== null) {
      // Çift yıldız match'leri ile çakışmayanları al
      const isInDoubleStar = allMatches.some(m => 
        match.index >= m.start && match.index < m.end
      );
      
      if (!isInDoubleStar) {
        allMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'strong',
          content: match[1],
          fullMatch: match[0]
        });
      }
    }
    
    // Index'e göre sırala
    allMatches.sort((a, b) => a.start - b.start);
    
    // Metni parse et
    allMatches.forEach((match) => {
      // Match'ten önceki metin
      if (match.start > currentIndex) {
        const beforeText = line.substring(currentIndex, match.start);
        if (beforeText) {
          parts.push({ type: 'text', content: beforeText });
        }
      }
      
      // Bold metin
      parts.push({ type: 'strong', content: match.content });
      currentIndex = match.end;
    });
    
    // Kalan metni ekle
    if (currentIndex < line.length) {
      const remaining = line.substring(currentIndex);
      if (remaining) {
        parts.push({ type: 'text', content: remaining });
      }
    }
    
    // Eğer hiç pattern yoksa, tüm satırı text olarak ekle
    if (parts.length === 0) {
      parts.push({ type: 'text', content: line });
    }
    
    // React elementlerini oluştur
    const elements = parts.map((part, partIndex) => {
      if (part.type === 'strong') {
        return React.createElement('strong', { key: `${lineIndex}-${partIndex}` }, part.content);
      }
      return React.createElement('span', { key: `${lineIndex}-${partIndex}` }, part.content);
    });
    
    // Satır sonu ekle (son satır hariç)
    const fragmentChildren = [...elements];
    if (lineIndex < lines.length - 1) {
      fragmentChildren.push(React.createElement('br'));
    }
    return React.createElement(
      React.Fragment,
      { key: lineIndex },
      fragmentChildren
    );
  });
};

export default formatText;

