import React from "react";

/**
 * HTML içeriğini güvenli bir şekilde render eder
 * Rich text editor'den gelen HTML içeriğini React elementine çevirir
 * 
 * @param {string} html - Render edilecek HTML string
 * @param {string} className - Ek CSS class'ları
 * @returns {React.ReactNode} - Render edilmiş HTML içeriği
 */
export const renderHTML = (html, className = "") => {
  if (!html) return null;

  // Eğer HTML tag'leri içermiyorsa, normal text olarak döndür
  if (!html.includes('<') && !html.includes('>')) {
    return <span className={className}>{html}</span>;
  }

  // HTML içeriğini temizle ve normalize et
  let cleanedHtml = html;
  
  // &nbsp; entity'lerini normal boşluklara çevir (liste içinde sorun yaratabilir)
  cleanedHtml = cleanedHtml.replace(/&nbsp;/g, ' ');
  
  // Boş paragrafları normalize et (<p><br></p> veya <p><br/></p> -> <p></p>)
  // Bu boş paragrafları koruyoruz çünkü kullanıcı Enter ile boş satır oluşturmuş olabilir
  cleanedHtml = cleanedHtml.replace(/<p><br\s*\/?><\/p>/gi, '<p></p>');
  
  // Sadece tamamen boş olan paragrafları koru (Enter ile oluşturulan boş satırlar için)
  // Quill editor'den gelen boş paragrafları normalize et ama koru
  cleanedHtml = cleanedHtml.replace(/<p>\s*<\/p>/g, '<p></p>');
  
  // Liste öğeleri arasındaki boş paragrafları kaldır (liste yapısını bozuyor)
  cleanedHtml = cleanedHtml.replace(/<\/ul>\s*<p>\s*<\/p>\s*<ul>/gi, '</ul><ul>');
  cleanedHtml = cleanedHtml.replace(/<\/ol>\s*<p>\s*<\/p>\s*<ol>/gi, '</ol><ol>');
  
  // Paragraflar arasındaki gereksiz boşlukları temizle
  cleanedHtml = cleanedHtml.replace(/<\/p>\s*<p>/g, '</p><p>');
  
  // Paragraflar içindeki gereksiz boşlukları temizle (başta ve sonda)
  cleanedHtml = cleanedHtml.replace(/<p>\s+/g, '<p>');
  cleanedHtml = cleanedHtml.replace(/\s+<\/p>/g, '</p>');
  
  // Liste öğelerinin içindeki gereksiz boşlukları temizle
  cleanedHtml = cleanedHtml.replace(/<li>\s+/g, '<li>');
  cleanedHtml = cleanedHtml.replace(/\s+<\/li>/g, '</li>');

  // HTML içeriğini render et - genişlik sınırlaması ile
  return (
    <div
      className={`rich-text-content ${className} max-w-full`}
      style={{
        maxWidth: '100%',
        wordBreak: 'normal', // Kelimeleri bölme
        overflowWrap: 'break-word', // Sadece gerekirse uzun kelimeleri böl
        hyphens: 'none', // Tire ile kelime bölmeyi kapat
      }}
      dangerouslySetInnerHTML={{ __html: cleanedHtml }}
    />
  );
};

export default renderHTML;

