import { useMemo, useEffect, useRef, useState, Component } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// Error Boundary for React 19 compatibility
class QuillErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Quill Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 min-h-[150px] flex items-center justify-center">
          <span className="text-red-500 dark:text-red-400">Editor yüklenirken hata oluştu. Lütfen sayfayı yenileyin.</span>
        </div>
      );
    }

    return this.props.children;
  }
}

const RichTextEditor = ({ value, onChange, placeholder = "", disabled = false, className = "" }) => {
  const quillRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Client-side rendering için
  useEffect(() => {
    setMounted(true);
  }, []);

  // Karakter sayısını hesapla (HTML tag'lerini çıkararak)
  const characterCount = useMemo(() => {
    if (!value) return 0;
    // HTML tag'lerini kaldırarak sadece metin içeriğini al
    // Önce HTML entity'lerini decode et
    const tempDiv = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (tempDiv) {
      tempDiv.innerHTML = value;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      return textContent.length;
    }
    // Fallback: Regex ile HTML tag'lerini kaldır (server-side için)
    const textOnly = value
      .replace(/<[^>]*>/g, '') // HTML tag'lerini kaldır
      .replace(/&nbsp;/g, ' ') // &nbsp;'yi boşlukla değiştir
      .replace(/&[a-z]+;/gi, '') // Diğer HTML entity'lerini kaldır
      .trim();
    return textOnly.length;
  }, [value]);

  // HTML içeriğinin toplam karakter sayısı (HTML tag'leri dahil)
  const totalCharacterCount = useMemo(() => {
    return value ? value.length : 0;
  }, [value]);

  // Quill modüllerini özelleştir
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "color",
    "background",
    "align",
    "link",
  ];

  // Dark mode için CSS ekle
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .rich-text-editor .quill {
        border-radius: 0.5rem;
        overflow: hidden;
      }
      .rich-text-editor .ql-container {
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        font-size: 0.875rem;
        min-height: 150px;
        background: white;
      }
      .dark .rich-text-editor .ql-container {
        background: rgb(51 65 85);
        color: white;
      }
      .rich-text-editor .ql-editor {
        min-height: 150px;
        color: rgb(17 24 39);
        max-width: 100%;
        word-break: normal;
        overflow-wrap: break-word;
        hyphens: none;
      }
      .rich-text-editor .ql-editor * {
        max-width: 100%;
        word-break: normal;
        overflow-wrap: break-word;
        hyphens: none;
      }
      .dark .rich-text-editor .ql-editor {
        color: white;
      }
      .rich-text-editor .ql-toolbar {
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
        border-bottom: 1px solid rgb(229 231 235);
        background: rgb(249 250 251);
      }
      .dark .rich-text-editor .ql-toolbar {
        background: rgb(30 41 59);
        border-bottom-color: rgb(51 65 85);
      }
      .dark .rich-text-editor .ql-toolbar .ql-stroke {
        stroke: rgb(203 213 225);
      }
      .dark .rich-text-editor .ql-toolbar .ql-fill {
        fill: rgb(203 213 225);
      }
      .dark .rich-text-editor .ql-toolbar button:hover,
      .dark .rich-text-editor .ql-toolbar button.ql-active {
        background: rgb(51 65 85);
      }
      .rich-text-editor .ql-toolbar button:hover,
      .rich-text-editor .ql-toolbar button.ql-active {
        background: rgb(229 231 235);
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  if (!mounted) {
    return (
      <div className={`rich-text-editor ${className}`}>
        <div className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 min-h-[150px] flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!ReactQuill) {
    return (
      <div className={`rich-text-editor ${className}`}>
        <div className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 min-h-[150px] flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">Editor yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      <QuillErrorBoundary>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value || ""}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          className="bg-white dark:bg-slate-700"
          style={{
            borderRadius: "0.5rem",
          }}
        />
        {/* Karakter sayacı */}
        <div className="mt-2 flex justify-end">
          <span className={`text-xs ${
            totalCharacterCount > 10000 
              ? 'text-red-500 dark:text-red-400' 
              : totalCharacterCount > 5000 
              ? 'text-yellow-500 dark:text-yellow-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            Metin: {characterCount.toLocaleString()} karakter | 
            HTML: {totalCharacterCount.toLocaleString()} karakter
          </span>
        </div>
      </QuillErrorBoundary>
    </div>
  );
};

export default RichTextEditor;

