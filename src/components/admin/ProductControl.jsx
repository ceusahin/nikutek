// ProductControl.jsx
import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";
import RichTextEditor from "./RichTextEditor";
import {
  Plus,
  Save,
  Trash2,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronRight,
  ImageIcon,
  ArrowUp,
  ArrowDown,
  Edit3,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

// ----------------- MAIN COMPONENT -----------------
export default function ProductControl() {
  const emptyDTO = () => ({
    id: null,
    imageUrl: "",
    active: true,
    parentId: null,
    translations: [],
    features: [],
    catalogs: [],
    children: [],
  });

  const { language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState(null);
  const [form, setForm] = useState(emptyDTO());
  const [originalForm, setOriginalForm] = useState(null); // Backend'den gelen orijinal veri
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [preservedParentId, setPreservedParentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [childModalOpen, setChildModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // HTML taglarını temizleyen fonksiyon (önizleme için)
  const stripHTML = (html) => {
    if (!html) return "";
    // HTML taglarını kaldır
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Form state değişikliklerini logla
  useEffect(() => {
    const currentTranslation = form.translations?.find((t) => t.langCode === language) || {};
    console.log("🔄 Form state güncellendi:", {
      id: form.id,
      imageUrl: form.imageUrl,
      active: form.active,
      parentId: form.parentId,
      displayOrder: form.displayOrder,
      translationsCount: form.translations?.length || 0,
      featuresCount: form.features?.length || 0,
      catalogsCount: form.catalogs?.length || 0,
      childrenCount: form.children?.length || 0,
      currentTranslation: currentTranslation,
      seoTitle: currentTranslation.seoTitle,
      seoDescription: currentTranslation.seoDescription,
      seoOgTitle: currentTranslation.seoOgTitle,
      translations: form.translations,
      features: form.features,
    });
  }, [form, language]);

  // ----------------- NORMALIZE HELPERS -----------------
  const normTranslation = (t) => {
    if (!t) return null;
    return {
      langCode: t.langCode || t.language?.code || t.languageId || t.language_id || "",
      title: t.title || t.name || "",
      description: t.description || t.desc || t.body || "",
      slug: t.slug || "",
      seoTitle: t.seoTitle || "",
      seoDescription: t.seoDescription || "",
      seoKeywords: t.seoKeywords || "",
      seoOgTitle: t.seoOgTitle || "",
      seoOgDescription: t.seoOgDescription || "",
      seoOgImage: t.seoOgImage || "",
    };
  };

  const normFeature = (f) => ({
    langCode: f.langCode || f.language?.code || f.languageId || f.language_id,
    name: f.name || f.featureName || f.feature_name || f.title || "",
    value: f.value || f.featureValue || f.feature_value || f.description || "",
    frequency: f.frequency || null,
  });

  const normCatalog = (c) => ({
    name: c.name || c.title || "",
    fileUrl: c.fileUrl || c.file_url || c.url || c.file || "",
  });

  const normalizeProductShallow = (p) => {
    if (!p) return emptyDTO();
    const normalized = {
      id: p.id ?? null,
      imageUrl: p.imageUrl ?? p.image_url ?? p.image ?? "",
      active: p.active !== undefined ? p.active : (p.isActive !== undefined ? p.isActive : true),
      parentId: p.parentId ?? p.parent_id ?? p.parent?.id ?? null,
      displayOrder: p.displayOrder ?? p.display_order ?? p.order ?? null,
      translations: (p.translations || []).map(normTranslation).filter(t => t !== null),
      features: (p.features || []).map(normFeature),
      catalogs: (p.catalogs || []).map(normCatalog),
      children: (p.children || []).map((ch) => ({
        id: ch.id ?? null,
        imageUrl: ch.imageUrl ?? ch.image_url ?? ch.image ?? "",
        active: ch.active !== undefined ? ch.active : (ch.isActive !== undefined ? ch.isActive : true),
        parentId: ch.parentId ?? ch.parent_id ?? ch.parent?.id ?? null,
        displayOrder: ch.displayOrder ?? ch.display_order ?? ch.order ?? null,
        translations: (ch.translations || []).map(normTranslation).filter(t => t !== null),
        features: (ch.features || []).map(normFeature),
        catalogs: (ch.catalogs || []).map(normCatalog),
        children: ch.children || [],
      })),
    };
    
    // Children'ları displayOrder'a göre sırala
    if (normalized.children && normalized.children.length > 0) {
      normalized.children.sort((a, b) => {
        const orderA = a.displayOrder ?? a.order ?? a.id ?? 0;
        const orderB = b.displayOrder ?? b.order ?? b.id ?? 0;
        return orderA - orderB;
      });
    }
    
    return normalized;
  };

  // ----------------- CRUD / TREE FUNCTIONS -----------------
  async function loadProducts() {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/products");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.products || res.data.content || [];
      // displayOrder veya order'a göre sırala (sadece parent ürünler için)
      const normalized = data.map(normalizeProductShallow);
      const sorted = normalized.sort((a, b) => {
        // Sadece parent ürünleri sırala
        if (a.parentId !== null || b.parentId !== null) return 0;
        const orderA = a.displayOrder ?? a.order ?? a.id ?? 0;
        const orderB = b.displayOrder ?? b.order ?? b.id ?? 0;
        return orderA - orderB;
      });
      setProducts(sorted);
      // console.log("Ürünler yüklendi:", res.data);
    } catch (e) {
      console.error(e);
      setError("Ürünler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  const handleReorder = async (productId, direction) => {
    try {
      // ÖNEMLİ: Sadece mevcut dilde çevirisi olan parent ürünleri al
      // Bu, UI'da görünen ürünlerle eşleşir
      const allParentProducts = products
        .filter((p) => p.parentId === null)
        .filter((p) => p.translations?.some((t) => t.langCode === language));
      
      // Sıralama: displayOrder'e göre, yoksa id'ye göre
      const sortedParentProducts = [...allParentProducts].sort((a, b) => {
        const orderA = a.displayOrder ?? a.order ?? a.id ?? 0;
        const orderB = b.displayOrder ?? b.order ?? b.id ?? 0;
        return orderA - orderB;
      });

      const currentIndex = sortedParentProducts.findIndex((p) => p.id === productId);
      if (currentIndex === -1) return;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= sortedParentProducts.length) return;

      // Sıralamayı güncelle
      const updatedProducts = [...sortedParentProducts];
      [updatedProducts[currentIndex], updatedProducts[newIndex]] = [
        updatedProducts[newIndex],
        updatedProducts[currentIndex],
      ];

      // Backend'e sıralama güncellemesi gönder
      const reorderData = updatedProducts.map((product, index) => ({
        id: product.id,
        displayOrder: index + 1,
      }));

      await axiosInstance.put("/products/reorder", { items: reorderData });
      await loadProducts();
    } catch (e) {
      console.error("Sıralama güncelleme hatası:", e);
      setError("Sıralama güncellenirken bir hata oluştu");
    }
  };

  async function loadProduct(id) {
    if (!id) {
      setForm(emptyDTO());
      setOriginalForm(null);
      setSelectedId(null);
      setPreservedParentId(null);
      return;
    }
    
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/products/${id}`);
      const raw = res.data || {};

      // DETAYLI LOGLAMA - Backend'den gelen raw veri
      console.log("========== ÜRÜN DETAY YÜKLEME ==========");
      console.log("Ürün ID:", id);
      console.log("Backend'den gelen RAW veri:", JSON.stringify(raw, null, 2));
      console.log("Raw veri yapısı:", {
        id: raw.id,
        imageUrl: raw.imageUrl,
        image_url: raw.image_url,
        active: raw.active,
        parentId: raw.parentId,
        parent_id: raw.parent_id,
        parent: raw.parent,
        translations: raw.translations,
        features: raw.features,
        catalogs: raw.catalogs,
        children: raw.children,
        displayOrder: raw.displayOrder,
        display_order: raw.display_order,
      });

      // Backend'den gelen veriyi normalize et
      const normalized = normalizeProductShallow(raw);

      // DETAYLI LOGLAMA - Normalize edilmiş veri
      console.log("Normalize edilmiş veri:", JSON.stringify(normalized, null, 2));
      console.log("Normalize edilmiş veri yapısı:", {
        id: normalized.id,
        imageUrl: normalized.imageUrl,
        active: normalized.active,
        parentId: normalized.parentId,
        displayOrder: normalized.displayOrder,
        translationsCount: normalized.translations?.length || 0,
        translations: normalized.translations,
        featuresCount: normalized.features?.length || 0,
        features: normalized.features,
        catalogsCount: normalized.catalogs?.length || 0,
        catalogs: normalized.catalogs,
        childrenCount: normalized.children?.length || 0,
        children: normalized.children,
      });

      // Backend'den gelen parentId'yi kontrol et
      const backendParentId =
        normalized.parentId ?? raw.parentId ?? raw.parent_id ?? raw.parent?.id ?? null;

      // Eğer backend'den parentId gelmiyorsa ve preservedParentId varsa, onu kullan
      const finalParentId = backendParentId || preservedParentId;

      // Translations'ı işle: slug boşsa otomatik oluştur
      const processedTranslations = (normalized.translations || []).map((t) => {
        let slug = t.slug || "";
        // Eğer slug boşsa ve title varsa, slug oluştur
        if (!slug && t.title) {
          slug = generateSlug(t.title);
          // Eğer ürün ID varsa, slug'a ekle
          if (normalized.id) {
            slug = `${slug}-${normalized.id}`;
          } else {
            // Yeni ürünse timestamp ekle
            slug = `${slug}-${Date.now()}`;
          }
        }
        return {
          ...t,
          slug: slug,
        };
      });

      // Normalize edilmiş veriyi kullan, parentId'yi güncelle ve translations'ı işle
      const finalNormalized = {
        ...normalized,
        parentId: finalParentId,
        translations: processedTranslations,
      };

      // DETAYLI LOGLAMA - Final veri
      console.log("Final normalize edilmiş veri (form'a set edilecek):", JSON.stringify(finalNormalized, null, 2));
      console.log("Final veri özeti:", {
        id: finalNormalized.id,
        imageUrl: finalNormalized.imageUrl,
        active: finalNormalized.active,
        parentId: finalNormalized.parentId,
        displayOrder: finalNormalized.displayOrder,
        translations: finalNormalized.translations?.map(t => ({
          langCode: t.langCode,
          title: t.title,
          descriptionLength: t.description?.length || 0,
          slug: t.slug,
        })),
        features: finalNormalized.features?.map(f => ({
          langCode: f.langCode,
          name: f.name,
          value: f.value,
          frequency: f.frequency,
        })),
        catalogs: finalNormalized.catalogs?.map(c => ({
          name: c.name,
          fileUrl: c.fileUrl,
        })),
        children: finalNormalized.children?.map(ch => ({
          id: ch.id,
          title: ch.translations?.[0]?.title || "Başlık yok",
        })),
      });

      // Debug: Normalize edilmiş veriyi kontrol et
      if (!finalNormalized.translations || finalNormalized.translations.length === 0) {
        console.warn("⚠️ Ürün yüklendi ama translations boş!");
        console.warn("Raw translations:", raw.translations);
      }

      console.log("========================================");

      // Orijinal veriyi sakla (save edilirken boş alanları doldurmak için)
      // Deep copy yaparak referans sorunlarını önle
      const originalFormCopy = JSON.parse(JSON.stringify(finalNormalized));
      setOriginalForm(originalFormCopy);

      // Form state'i güncelle - önceki verilerin karışmaması için doğrudan yeni veriyi set et
      setForm(JSON.parse(JSON.stringify(finalNormalized)));
      setSelectedId(id);
      if (finalNormalized.parentId)
        setExpanded((prev) => ({ ...prev, [finalNormalized.parentId]: true }));
    } catch (e) {
      console.error("❌ Ürün yükleme hatası:", e);
      console.error("Hata detayı:", e.response?.data || e.message);
      setError("Ürün detay yüklenirken hata oluştu");
      // Hata durumunda form state'i temizle
      setForm(emptyDTO());
      setOriginalForm(null);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }

  // Slug oluşturma fonksiyonu
  const generateSlug = (title) => {
    if (!title) return "";
    return title
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  async function save() {
    console.log("🔵 SAVE BUTONUNA TIKLANDI!");
    console.log("Save fonksiyonu çağrıldı, form state:", JSON.stringify(form, null, 2));
    
    // Form state'i kontrol et
    if (!form) {
      console.error("❌ Form state boş!");
      setError("Form verisi bulunamadı!");
      return;
    }

    setSaving(true);
    try {
      console.log("========== ÜRÜN KAYDETME ==========");
      console.log("Form state (kaydedilecek veri):", JSON.stringify(form, null, 2));
      
      const currentParentId = form.parentId;

      if (currentParentId) {
        setPreservedParentId(currentParentId);
      }

      // Translations'ı düzelt: boş alanları orijinal veriden doldur ve slug oluştur
      const fixedTranslations = (form.translations || []).map((t) => {
        // Orijinal translation'ı bul (aynı langCode için)
        const originalTranslation = originalForm?.translations?.find(
          (ot) => ot.langCode === t.langCode
        ) || {};

        // Title: form state'te varsa kullan, yoksa orijinalden al
        let title = t.title || originalTranslation.title || "";
        
        // Slug: form state'te varsa kullan, yoksa orijinalden al, yoksa title'dan oluştur
        let slug = t.slug || originalTranslation.slug || "";
        if (!slug || slug.trim() === "") {
          if (title && title.trim() !== "") {
            slug = generateSlug(title);
            // Eğer yeni ürünse (ID yoksa), slug'a timestamp ekle
            if (!form.id) {
              slug = `${slug}-${Date.now()}`;
            } else {
              // Mevcut ürünse, slug'a ID ekle (unique olması için)
              slug = `${slug}-${form.id}`;
            }
          }
        }
        
        return {
          ...t,
          title: title,
          slug: slug,
          // Diğer alanları da orijinalden doldur eğer boşsa
          description: t.description || originalTranslation.description || "",
          seoTitle: t.seoTitle || originalTranslation.seoTitle || "",
          seoDescription: t.seoDescription || originalTranslation.seoDescription || "",
          seoKeywords: t.seoKeywords || originalTranslation.seoKeywords || "",
          seoOgTitle: t.seoOgTitle || originalTranslation.seoOgTitle || "",
          seoOgDescription: t.seoOgDescription || originalTranslation.seoOgDescription || "",
          seoOgImage: t.seoOgImage || originalTranslation.seoOgImage || "",
        };
      });

      console.log("Düzeltilmiş translations:", JSON.stringify(fixedTranslations, null, 2));

      const payload = {
        id: form.id,
        parentId: form.parentId,
        imageUrl: form.imageUrl,
        active: form.active,
        displayOrder: form.displayOrder ?? null,
        translations: fixedTranslations,
        features: form.features || [],
        catalogs: form.catalogs || [],
        children: (form.children || []).map((c) => ({
          ...c,
          parentId: c.parentId ?? form.id,
        })),
      };

      console.log("Backend'e gönderilecek payload:", JSON.stringify(payload, null, 2));
      console.log("Payload özeti:", {
        id: payload.id,
        parentId: payload.parentId,
        imageUrl: payload.imageUrl,
        active: payload.active,
        displayOrder: payload.displayOrder,
        translationsCount: payload.translations?.length || 0,
        featuresCount: payload.features?.length || 0,
        catalogsCount: payload.catalogs?.length || 0,
        childrenCount: payload.children?.length || 0,
      });

      const res = await axiosInstance.post("/products/save", payload);
      const saved = res.data;

      console.log("Backend'den dönen kaydedilmiş veri:", JSON.stringify(saved, null, 2));
      console.log("Kaydedilmiş veri özeti:", {
        id: saved?.id,
        parentId: saved?.parentId,
        translationsCount: saved?.translations?.length || 0,
        featuresCount: saved?.features?.length || 0,
        catalogsCount: saved?.catalogs?.length || 0,
        childrenCount: saved?.children?.length || 0,
      });

      await loadProducts();

      // Kaydetme sonrası parentId'yi koruyarak form'u güncelle
      if (saved && saved.id) {
        // Backend'den dönen veriyi normalize et
        const normalized = normalizeProductShallow(saved);
        
        console.log("Backend'den dönen veri normalize edildi:", JSON.stringify(normalized, null, 2));
        
        // Backend'den gelen parentId'yi kontrol et
        const backendParentId =
          normalized.parentId ?? saved.parentId ?? saved.parent_id ?? saved.parent?.id ?? null;
        
        // Eğer backend'den parentId gelmiyorsa ve currentParentId varsa, onu kullan
        const finalParentId = backendParentId || currentParentId;
        
        // Form'u backend'den dönen veriyle güncelle
        const updatedForm = {
          ...normalized,
          parentId: finalParentId,
        };
        
        console.log("Form güncelleniyor, yeni form state:", JSON.stringify(updatedForm, null, 2));
        
        // Orijinal form'u da güncelle
        setOriginalForm(JSON.parse(JSON.stringify(updatedForm)));
        
        setForm(updatedForm);
        setSelectedId(saved.id);
      } else {
        console.warn("⚠️ Backend'den saved.id gelmedi, loadProduct ile tekrar yükleniyor...");
        // Eğer saved.id yoksa, loadProduct ile tekrar yükle
        if (form.id) {
          await loadProduct(form.id);
        } else if (saved?.id) {
          // Eğer yeni ürün oluşturulduysa, yeni ID ile yükle
          await loadProduct(saved.id);
        }
      }
      
      console.log("✅ Kaydetme işlemi tamamlandı");
      console.log("========================================");
    } catch (e) {
      console.error("❌ Kaydetme hatası:", e);
      console.error("Hata detayı:", e.response?.data || e.message);
      console.error("Hata response:", e.response);
      setError("Kaydetme sırasında hata oluştu: " + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct() {
    if (!form.id) return setError("Silinecek ürün seçili değil");
    if (!confirm("Bu ürünü silmek istediğine emin misin?")) return;
    try {
      await axiosInstance.delete(`/products/${form.id}`);
      setForm(emptyDTO());
      await loadProducts();
    } catch (e) {
      console.error(e);
      setError("Silme sırasında hata oluştu");
    }
  }

  async function toggleActive() {
    if (!form.id) return setError("Ürün seçili değil");
    try {
      const res = await axiosInstance.post(`/products/${form.id}/toggle`);
      // Toggle sonrası form'u güncelle
      setForm((prev) => ({ ...prev, active: res.data.active }));
      await loadProducts();
    } catch (e) {
      console.error(e);
      setError("Aktiflik değiştirilemedi");
    }
  }

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const startNew = () => {
    const dto = {
      id: null,
      imageUrl: "",
      active: true,
      parentId: null,
      translations: [{ 
        langCode: language, 
        title: "", 
        description: "",
        slug: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
        seoOgTitle: "",
        seoOgDescription: "",
        seoOgImage: "",
      }],
      features: [],
      catalogs: [],
      children: [],
    };
    setForm(dto);
    setOriginalForm(null);
    setSelectedId(null);
    setPreservedParentId(null);
  };

  async function addChild() {
    if (!form.id) {
      await save(); // parent kaydedilecek ve form.id dolacak
    }
    setEditingChild(null);
    setChildModalOpen(true);
  }

  const openEditChildModal = (child) => {
    setEditingChild(child);
    setChildModalOpen(true);
  };

  const closeChildModal = () => {
    setChildModalOpen(false);
    setEditingChild(null);
  };

  const saveChild = async (childData) => {
    try {
      setSaving(true);
      
      // Child'ın parentId'sini parent'ın id'si olarak ayarla
      const payload = {
        ...childData,
        parentId: form.id,
      };

      await axiosInstance.post("/products/save", payload);
      await loadProducts();
      
      // Form'u güncelle (children listesini refresh et)
      if (form.id) {
        await loadProduct(form.id);
      }

      closeChildModal();
    } catch (e) {
      console.error(e);
      setError("Alt ürün kaydedilirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const deleteChild = async (childId) => {
    if (!confirm("Bu alt ürünü silmek istediğinize emin misiniz?")) return;
    try {
      await axiosInstance.delete(`/products/${childId}`);
      await loadProducts();
      
      // Form'u güncelle
      if (form.id) {
        await loadProduct(form.id);
      }
    } catch (e) {
      console.error(e);
      setError("Alt ürün silinirken hata oluştu");
    }
  };

  const toggleChildActive = async (childId) => {
    try {
      await axiosInstance.post(`/products/${childId}/toggle`);
      await loadProducts();
      
      // Form'u güncelle
      if (form.id) {
        await loadProduct(form.id);
      }
    } catch (e) {
      console.error(e);
      setError("Aktiflik değiştirilemedi");
    }
  };

  const handleReorderChild = async (childId, direction, parentId = null) => {
    try {
      // Parent ID'yi belirle: parametre olarak verilmişse onu kullan, yoksa form.id'yi kullan
      const targetParentId = parentId || form.id;
      
      if (!targetParentId) {
        console.error("Alt ürün sıralama: Parent ID bulunamadı", { childId, parentId, formId: form.id });
        return;
      }

      console.log("Alt ürün sıralama başladı:", { childId, direction, targetParentId });

      // Parent ürünü bul - önce products state'inden, yoksa API'den çek
      let parentProduct = products.find((p) => p.id === targetParentId);
      
      // Eğer products state'inde bulunamadıysa, API'den çek
      if (!parentProduct) {
        console.log("Parent ürün products state'inde bulunamadı, API'den çekiliyor...");
        const res = await axiosInstance.get(`/products/${targetParentId}`);
        parentProduct = normalizeProductShallow(res.data);
      }

      if (!parentProduct) {
        console.error("Alt ürün sıralama: Parent ürün bulunamadı", targetParentId);
        return;
      }

      // Children'ları normalize et - parentId'yi kesinlikle targetParentId yap
      const normalizedChildren = (parentProduct.children || []).map((ch) => ({
        id: ch.id ?? null,
        imageUrl: ch.imageUrl ?? ch.image_url ?? ch.image ?? "",
        active: ch.active !== undefined ? ch.active : (ch.isActive !== undefined ? ch.isActive : true),
        parentId: targetParentId, // Kesinlikle targetParentId kullan
        displayOrder: ch.displayOrder ?? ch.display_order ?? ch.order ?? null,
        translations: (ch.translations || []).map(normTranslation).filter(t => t !== null),
        features: ch.features || [],
        catalogs: ch.catalogs || [],
        children: ch.children || [],
      }));

      // Mevcut dilde çevirisi olan alt ürünleri al (sadece bu parent'a ait olanlar)
      const filteredChildren = normalizedChildren.filter((c) =>
        c.translations?.some((t) => t.langCode === language) && 
        (c.parentId === targetParentId || c.parentId === null)
      );

      if (filteredChildren.length === 0) {
        console.error("Alt ürün sıralama: Sıralanacak alt ürün bulunamadı", {
          normalizedChildren: normalizedChildren.length,
          targetParentId,
          language
        });
        return;
      }

      // Sıralama: displayOrder'e göre, yoksa id'ye göre
      const sortedChildren = [...filteredChildren].sort((a, b) => {
        const orderA = a.displayOrder ?? a.order ?? a.id ?? 0;
        const orderB = b.displayOrder ?? b.order ?? b.id ?? 0;
        return orderA - orderB;
      });

      console.log("Sıralanmış alt ürünler:", sortedChildren.map(c => ({ id: c.id, displayOrder: c.displayOrder, title: c.translations?.[0]?.title })));

      const currentIndex = sortedChildren.findIndex((c) => c.id === childId);
      if (currentIndex === -1) {
        console.error("Alt ürün sıralama: Ürün bulunamadı", { childId, sortedChildren: sortedChildren.map(c => c.id) });
        return;
      }

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= sortedChildren.length) {
        console.error("Alt ürün sıralama: Geçersiz index", { currentIndex, newIndex, length: sortedChildren.length });
        return;
      }

      console.log("Sıralama değişikliği:", {
        currentIndex,
        newIndex,
        current: sortedChildren[currentIndex].id,
        new: sortedChildren[newIndex].id,
        direction
      });

      // Sıralamayı güncelle
      const updatedChildren = [...sortedChildren];
      [updatedChildren[currentIndex], updatedChildren[newIndex]] = [
        updatedChildren[newIndex],
        updatedChildren[currentIndex],
      ];

      // Backend'e sıralama güncellemesi gönder
      // ÖNEMLİ: Sadece bu parent'a ait alt ürünlerin sıralamasını güncelle
      const reorderData = updatedChildren.map((child, index) => ({
        id: child.id,
        displayOrder: index + 1,
        parentId: targetParentId, // Parent ID'yi de gönder
      }));

      console.log("Alt ürün sıralama - Backend'e gönderilen data:", reorderData);

      // Backend'e istek gönder
      await axiosInstance.put("/products/reorder", { items: reorderData });
      
      // Backend'den fresh data çek
      await loadProducts();
      
      // Form'u güncelle - sadece form.id ile eşleşiyorsa
      if (targetParentId === form.id && form.id) {
        await loadProduct(form.id);
      }

      console.log("Alt ürün sıralama tamamlandı");
    } catch (e) {
      console.error("Alt ürün sıralama güncelleme hatası:", e);
      setError("Alt ürün sıralaması güncellenirken bir hata oluştu: " + (e.response?.data?.message || e.message));
      // Hata durumunda form'u yeniden yükle
      if (form.id) {
        await loadProduct(form.id);
      }
    }
  };

  const updateField = (path, value) =>
    setForm((prev) => ({ ...prev, [path]: value }));

  const handleUpload = async (file, onDone) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await axiosInstance.post("/products/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onDone(res.data);
    } catch (e) {
      console.error(e);
      setError("Dosya yüklenirken hata oluştu");
    }
  };

  // useMemo ile translationForLang'i memoize et - form ve originalForm değiştiğinde yeniden hesapla
  const currentTranslation = useMemo(() => {
    // Önce form.translations'tan bul
    if (form && form.translations && form.translations.length > 0) {
      const found = form.translations.find((t) => t && t.langCode === language);
      if (found) {
        return {
          langCode: found.langCode || language,
          title: found.title || "",
          description: found.description || "",
          slug: found.slug || "",
          seoTitle: found.seoTitle || "",
          seoDescription: found.seoDescription || "",
          seoKeywords: found.seoKeywords || "",
          seoOgTitle: found.seoOgTitle || "",
          seoOgDescription: found.seoOgDescription || "",
          seoOgImage: found.seoOgImage || "",
        };
      }
    }
    
    // Eğer form.translations'ta bulunamadıysa, originalForm'dan al
    if (originalForm && originalForm.translations && originalForm.translations.length > 0) {
      const originalFound = originalForm.translations.find((t) => t && t.langCode === language);
      if (originalFound) {
        return {
          langCode: originalFound.langCode || language,
          title: originalFound.title || "",
          description: originalFound.description || "",
          slug: originalFound.slug || "",
          seoTitle: originalFound.seoTitle || "",
          seoDescription: originalFound.seoDescription || "",
          seoKeywords: originalFound.seoKeywords || "",
          seoOgTitle: originalFound.seoOgTitle || "",
          seoOgDescription: originalFound.seoOgDescription || "",
          seoOgImage: originalFound.seoOgImage || "",
        };
      }
    }
    
    // Mevcut translation yoksa, yeni bir boş translation oluştur
    return {
      langCode: language,
      title: "",
      description: "",
      slug: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      seoOgTitle: "",
      seoOgDescription: "",
      seoOgImage: "",
    };
  }, [form, originalForm, language]);

  const translationForLang = (translations = []) => {
    // Önce verilen translations array'inden bul
    if (translations && translations.length > 0) {
      const found = translations.find((t) => t && t.langCode === language);
      if (found) {
        return {
          langCode: found.langCode || language,
          title: found.title || "",
          description: found.description || "",
          slug: found.slug || "",
          seoTitle: found.seoTitle || "",
          seoDescription: found.seoDescription || "",
          seoKeywords: found.seoKeywords || "",
          seoOgTitle: found.seoOgTitle || "",
          seoOgDescription: found.seoOgDescription || "",
          seoOgImage: found.seoOgImage || "",
        };
      }
    }
    
    // Eğer verilen translations'ta bulunamadıysa, currentTranslation'ı döndür
    return currentTranslation;
  };

  // Arama fonksiyonu
  const filteredProducts = (products) => {
    if (!searchTerm.trim()) return products;

    return products.filter((product) => {
      const currentTranslation = product.translations?.find(
        (t) => t.langCode === language
      );
      if (!currentTranslation) return false;

      const searchLower = searchTerm.toLowerCase();
      return (
        currentTranslation.title?.toLowerCase().includes(searchLower) ||
        false ||
        currentTranslation.description?.toLowerCase().includes(searchLower) ||
        false
      );
    });
  };

  // ----------------- TREE RENDER -----------------
  const renderTree = (items = [], level = 0) => {
    // Önce displayOrder'a göre sırala
    const sortedItems = [...items].sort((a, b) => {
      const orderA = a.displayOrder ?? a.order ?? a.id ?? 0;
      const orderB = b.displayOrder ?? b.order ?? b.id ?? 0;
      return orderA - orderB;
    });

    return (
      <ul className="space-y-1">
        {sortedItems
          .filter((i) => i.translations?.some((t) => t.langCode === language))
          .map((i) => {
          const activeTranslation = i.translations.find(
            (t) => t.langCode === language
          );
          const visibleChildCount = (i.children || []).filter((c) =>
            c.translations?.some((t) => t.langCode === language)
          ).length;
          const isExpanded = !!expanded[i.id];
          const isSelected = selectedId === i.id;
          const isParent = i.parentId === null;

          return (
            <li key={i.id} className="flex flex-col">
              <div
                className={`group flex items-center gap-3 py-3 px-3 rounded-lg cursor-pointer select-none transition-all duration-200 ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 shadow-sm"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 border border-transparent"
                } ${level > 0 ? "ml-4" : ""}`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(i.id);
                  }}
                  className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {visibleChildCount > 0 ? (
                    isExpanded ? (
                      <ChevronDown
                        size={16}
                        className="text-gray-600 dark:text-gray-300"
                      />
                    ) : (
                      <ChevronRight
                        size={16}
                        className="text-gray-600 dark:text-gray-300"
                      />
                    )
                  ) : (
                    <span style={{ width: 16, display: "inline-block" }} />
                  )}
                </button>

                <div
                  onClick={() => loadProduct(i.id)}
                  className="flex-1 min-w-0"
                  title={activeTranslation?.title || "(Başlık yok)"}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isParent ? "bg-blue-500" : "bg-green-500"
                      }`}
                    />
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                      {activeTranslation?.title || "(Başlık yok)"}
                    </div>
                    {!i.active && (
                      <span className="text-xs bg-red-100 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                        Pasif
                      </span>
                    )}
                  </div>
                  {activeTranslation?.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate ml-4">
                      {stripHTML(activeTranslation.description).slice(0, 50) +
                        (stripHTML(activeTranslation.description).length > 50
                          ? "..."
                          : "")}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {visibleChildCount > 0 && (
                    <div className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                      {visibleChildCount}
                    </div>
                  )}
                  {/* Sıralama butonları - Ana ürünler için */}
                  {isParent && (() => {
                    const parentProducts = filteredProducts(products).filter(
                      (p) => p.parentId === null
                    );
                    const currentIndex = parentProducts.findIndex((p) => p.id === i.id);
                    const isFirst = currentIndex === 0;
                    const isLast = currentIndex === parentProducts.length - 1;
                    
                    return (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isFirst) {
                              handleReorder(i.id, "up");
                            }
                          }}
                          disabled={isFirst}
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Yukarı Taşı"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isLast) {
                              handleReorder(i.id, "down");
                            }
                          }}
                          disabled={isLast}
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Aşağı Taşı"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                    );
                  })()}
                  {/* Sıralama butonları - Alt ürünler için */}
                  {!isParent && i.parentId && (() => {
                    // Aynı parent altındaki tüm alt ürünleri bul
                    const parentProduct = products.find((p) => p.id === i.parentId);
                    if (!parentProduct || !parentProduct.children) return null;
                    
                    const siblings = parentProduct.children.filter((c) =>
                      c.translations?.some((t) => t.langCode === language)
                    );
                    
                    // Sıralama: displayOrder'e göre, yoksa id'ye göre
                    const sortedSiblings = [...siblings].sort((a, b) => {
                      const orderA = a.displayOrder ?? a.order ?? a.id ?? 0;
                      const orderB = b.displayOrder ?? b.order ?? b.id ?? 0;
                      return orderA - orderB;
                    });
                    
                    const currentIndex = sortedSiblings.findIndex((s) => s.id === i.id);
                    if (currentIndex === -1) return null;
                    
                    const isFirst = currentIndex === 0;
                    const isLast = currentIndex === sortedSiblings.length - 1;
                    
                    return (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isFirst) {
                              handleReorderChild(i.id, "up", i.parentId);
                            }
                          }}
                          disabled={isFirst}
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Yukarı Taşı"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isLast) {
                              handleReorderChild(i.id, "down", i.parentId);
                            }
                          }}
                          disabled={isLast}
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Aşağı Taşı"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                    );
                  })()}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        loadProduct(i.id);
                      }}
                      className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600 dark:text-blue-400 transition-colors"
                      title="Düzenle"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              {isExpanded && i.children?.length > 0 && (
                <div className="ml-6 border-l-2 border-gray-100 dark:border-gray-700 pl-2">
                  {renderTree(
                    [...i.children].sort((a, b) => {
                      const orderA = a.displayOrder ?? a.order ?? a.id ?? 0;
                      const orderB = b.displayOrder ?? b.order ?? b.id ?? 0;
                      return orderA - orderB;
                    }),
                    level + 1
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  // ----------------- RENDER UI -----------------
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Ürün Yönetimi
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
              Ürünlerinizi ve alt ürünlerinizi yönetin
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
            <div className="bg-white dark:bg-gray-900 rounded-lg px-3 md:px-4 dark:border-gray-800 py-2 shadow-sm border border-gray-200 flex-1 sm:flex-initial">
              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Toplam:
              </span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
                {products.length}
              </span>
            </div>
            <button
              onClick={loadProducts}
              className="flex dark:bg-gray-800 dark:border-gray-700 items-center gap-2 bg-white hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 md:px-4 py-2 rounded-lg shadow-sm border border-gray-200 transition-colors"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Yenile</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
        {/* LEFT SIDEBAR */}
        <div className="xl:col-span-4 col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Sidebar Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 md:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-white font-semibold text-sm md:text-base">Ürün Listesi</h3>
                <button
                  onClick={startNew}
                  className="flex items-center gap-2 w-full sm:w-auto justify-center border-white cursor-pointer bg-blue-800 dark:bg-gray-900/30 text-white px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors backdrop-blur-sm"
                >
                  <Plus size={14} />
                  Yeni Ürün
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="p-3 md:p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <div className="absolute left-3 top-2.5">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-300"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Products Tree */}
            <div className="p-3 md:p-4 max-h-[400px] md:max-h-[calc(100vh-300px)] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-500 dark:text-gray-400">
                    Yükleniyor...
                  </span>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Layers className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Henüz ürün yok
                  </p>
                  <button
                    onClick={startNew}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-medium"
                  >
                    İlk ürününüzü oluşturun
                  </button>
                </div>
              ) : filteredProducts(products).length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Arama sonucu bulunamadı
                  </p>
                  <p className="text-gray-400 text-sm">
                    "{searchTerm}" için sonuç yok
                  </p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-medium mt-2"
                  >
                    Aramayı temizle
                  </button>
                </div>
              ) : (
                renderTree(filteredProducts(products))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT DETAILS */}
        <div className="xl:col-span-8 col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {form.id ? "Ürün Düzenle" : "Yeni Ürün"}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {form.id ? `ID: ${form.id}` : "Yeni bir ürün oluşturun"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                      form.active ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200">
                    {form.active ? "Aktif" : "Pasif"}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-4 md:p-6 max-h-[600px] md:max-h-none overflow-y-auto">
              {/* Basic Information */}
              <div className="mb-8">
                <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded"></div>
                  Temel Bilgiler
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Ürün Başlığı
                    </label>
                    <input
                      placeholder="Ürün başlığını girin..."
                      value={currentTranslation.title || ""}
                      onChange={(e) => {
                        setForm((prev) => {
                          const existingTranslation = (prev.translations || []).find(
                            (t) => t && t.langCode === language
                          ) || currentTranslation;
                          return {
                            ...prev,
                            translations: [
                              ...(prev.translations || []).filter(
                                (x) => x && x.langCode !== language
                              ),
                              { 
                                ...existingTranslation, 
                                title: e.target.value, 
                                langCode: language 
                              },
                            ],
                          };
                        });
                      }}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Durum
                    </label>
                    <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        id="active"
                        checked={form.active}
                        onChange={(e) =>
                          updateField("active", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="active"
                        className="text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
                        Ürün aktif
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Ana Ürün Seçimi
                    <span className="text-xs text-gray-500 ml-2">
                      (Alt ürün yapmak için bir ana ürün seçin, ana ürün yapmak için "Yok (Ana Ürün)" seçin)
                    </span>
                  </label>
                  <select
                    value={form.parentId || ""}
                    onChange={(e) => {
                      const newParentId = e.target.value === "" ? null : parseInt(e.target.value);
                      updateField("parentId", newParentId);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Yok (Ana Ürün)</option>
                    {products
                      .filter((p) => {
                        // Sadece ana ürünleri göster (parentId null olanlar)
                        if (p.parentId !== null) return false;
                        // Mevcut ürünü hariç tut (bir ürün kendi parent'ı olamaz)
                        if (form.id && p.id === form.id) return false;
                        // Mevcut dilde çevirisi olanları göster
                        return p.translations?.some((t) => t.langCode === language);
                      })
                      .map((p) => {
                        const t = p.translations?.find((tr) => tr.langCode === language);
                        return (
                          <option key={p.id} value={p.id}>
                            {t?.title || `Ürün #${p.id}`}
                          </option>
                        );
                      })}
                  </select>
                  {form.parentId && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Bu ürün bir alt ürün olarak işaretlenmiş. Ana ürün yapmak için "Yok (Ana Ürün)" seçin.
                    </p>
                  )}
                  {!form.parentId && form.id && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Bu ürün bir ana üründür. Alt ürün yapmak için yukarıdan bir ana ürün seçin.
                    </p>
                  )}
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Açıklama
                  </label>
                  <RichTextEditor
                    value={currentTranslation.description || ""}
                    onChange={(value) => {
                      setForm((prev) => {
                        const existingTranslation = (prev.translations || []).find(
                          (t) => t && t.langCode === language
                        ) || currentTranslation;
                        return {
                          ...prev,
                          translations: [
                            ...(prev.translations || []).filter(
                              (x) => x && x.langCode !== language
                            ),
                            {
                              ...existingTranslation,
                              description: value,
                              langCode: language,
                            },
                          ],
                        };
                      });
                    }}
                    placeholder="Ürün açıklamasını girin..."
                  />
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Slug (SEO URL) <span className="text-xs text-gray-500">(Boş bırakılırsa otomatik oluşturulur)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="urun-slug-ornegi"
                    value={currentTranslation.slug || ""}
                    onChange={(e) => {
                      setForm((prev) => {
                        const existingTranslation = (prev.translations || []).find(
                          (t) => t && t.langCode === language
                        ) || currentTranslation;
                        return {
                          ...prev,
                          translations: [
                            ...(prev.translations || []).filter(
                              (x) => x && x.langCode !== language
                            ),
                            {
                              ...existingTranslation,
                              slug: e.target.value,
                              langCode: language,
                            },
                          ],
                        };
                      });
                    }}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    URL'de görünecek: /urunlerimiz/{translationForLang(form.translations).slug || "urun-slug"}
                  </p>
                </div>
              </div>

              {/* SEO Ayarları */}
              <div className="mb-6 md:mb-8">
                <h4 className="text-sm md:text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 md:h-6 bg-green-500 rounded"></div>
                  SEO Ayarları
                </h4>

                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SEO Başlık (Title)
                    </label>
                    <input
                      type="text"
                      placeholder="SEO için sayfa başlığı"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={currentTranslation.seoTitle || ""}
                      onChange={(e) => {
                        setForm((prev) => {
                          const existingTranslation = (prev.translations || []).find(
                            (t) => t && t.langCode === language
                          ) || currentTranslation;
                          return {
                            ...prev,
                            translations: [
                              ...(prev.translations || []).filter(
                                (x) => x && x.langCode !== language
                              ),
                              {
                                ...existingTranslation,
                                seoTitle: e.target.value,
                                langCode: language,
                              },
                            ],
                          };
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SEO Açıklama (Description)
                    </label>
                    <textarea
                      placeholder="SEO için meta açıklama"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows="3"
                      value={currentTranslation.seoDescription || ""}
                      onChange={(e) => {
                        setForm((prev) => {
                          const existingTranslation = (prev.translations || []).find(
                            (t) => t && t.langCode === language
                          ) || currentTranslation;
                          return {
                            ...prev,
                            translations: [
                              ...(prev.translations || []).filter(
                                (x) => x && x.langCode !== language
                              ),
                              {
                                ...existingTranslation,
                                seoDescription: e.target.value,
                                langCode: language,
                              },
                            ],
                          };
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SEO Anahtar Kelimeler (Keywords)
                    </label>
                    <input
                      type="text"
                      placeholder="anahtar, kelime, liste (virgülle ayrılmış)"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={currentTranslation.seoKeywords || ""}
                      onChange={(e) => {
                        setForm((prev) => {
                          const existingTranslation = (prev.translations || []).find(
                            (t) => t && t.langCode === language
                          ) || currentTranslation;
                          return {
                            ...prev,
                            translations: [
                              ...(prev.translations || []).filter(
                                (x) => x && x.langCode !== language
                              ),
                              {
                                ...existingTranslation,
                                seoKeywords: e.target.value,
                                langCode: language,
                              },
                            ],
                          };
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Open Graph Başlık (OG Title)
                    </label>
                    <input
                      type="text"
                      placeholder="Sosyal medya paylaşımı için başlık"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={currentTranslation.seoOgTitle || ""}
                      onChange={(e) => {
                        setForm((prev) => {
                          const existingTranslation = (prev.translations || []).find(
                            (t) => t && t.langCode === language
                          ) || currentTranslation;
                          return {
                            ...prev,
                            translations: [
                              ...(prev.translations || []).filter(
                                (x) => x && x.langCode !== language
                              ),
                              {
                                ...existingTranslation,
                                seoOgTitle: e.target.value,
                                langCode: language,
                              },
                            ],
                          };
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Open Graph Açıklama (OG Description)
                    </label>
                    <textarea
                      placeholder="Sosyal medya paylaşımı için açıklama"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows="2"
                      value={currentTranslation.seoOgDescription || ""}
                      onChange={(e) => {
                        setForm((prev) => {
                          const existingTranslation = (prev.translations || []).find(
                            (t) => t && t.langCode === language
                          ) || currentTranslation;
                          return {
                            ...prev,
                            translations: [
                              ...(prev.translations || []).filter(
                                (x) => x && x.langCode !== language
                              ),
                              {
                                ...existingTranslation,
                                seoOgDescription: e.target.value,
                                langCode: language,
                              },
                            ],
                          };
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Open Graph Görsel (OG Image URL)
                    </label>
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={currentTranslation.seoOgImage || ""}
                      onChange={(e) => {
                        setForm((prev) => {
                          const existingTranslation = (prev.translations || []).find(
                            (t) => t && t.langCode === language
                          ) || currentTranslation;
                          return {
                            ...prev,
                            translations: [
                              ...(prev.translations || []).filter(
                                (x) => x && x.langCode !== language
                              ),
                              {
                                ...existingTranslation,
                                seoOgImage: e.target.value,
                                langCode: language,
                              },
                            ],
                          };
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Media & Children Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Image Upload */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-500 rounded"></div>
                    Ürün Görseli
                  </h4>
                  <div className="space-y-4">
                    {form.imageUrl ? (
                      <div className="relative group">
                        <img
                          src={form.imageUrl}
                          alt="Ürün görseli"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                        <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <button
                            onClick={() => updateField("imageUrl", "")}
                            className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                          >
                            Görseli Sil
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                          Ürün görseli yok
                        </p>
                        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          Görsel Yükle
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) =>
                              await handleUpload(e.target.files[0], (url) =>
                                updateField("imageUrl", url)
                              )
                            }
                          />
                        </label>
                      </div>
                    )}
                    {!form.imageUrl && (
                      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
                        <ImageIcon size={16} />
                        Görsel Seç
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={async (e) =>
                            await handleUpload(e.target.files[0], (url) =>
                              updateField("imageUrl", url)
                            )
                          }
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Children List - Sadece ana ürünler için göster */}
                {form.parentId === null && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <div className="w-1 h-6 bg-purple-500 rounded"></div>
                        Alt Ürünler
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          ({form.children?.filter((c) =>
                            c.translations?.some((t) => t.langCode === language)
                          ).length || 0})
                        </span>
                      </h4>
                      <button
                        onClick={addChild}
                        disabled={!form.id}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        title={!form.id ? "Önce ana ürünü kaydedin" : "Yeni Alt Ürün Ekle"}
                      >
                        <Plus size={14} />
                        Alt Ürün Ekle
                      </button>
                    </div>
                    
                    {form.children?.filter((c) =>
                      c.translations?.some((t) => t.langCode === language)
                    ).length > 0 ? (
                      <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {form.children
                          .filter((c) =>
                            c.translations?.some((t) => t.langCode === language)
                          )
                          .sort((a, b) => {
                            const orderA = a.displayOrder ?? a.order ?? a.id ?? 0;
                            const orderB = b.displayOrder ?? b.order ?? b.id ?? 0;
                            return orderA - orderB;
                          })
                          .map((c) => {
                            const t = c.translations.find(
                              (x) => x.langCode === language
                            );
                            const filteredChildren = form.children.filter((c) =>
                              c.translations?.some((t) => t.langCode === language)
                            );
                            const sortedChildren = [...filteredChildren].sort((a, b) => {
                              const orderA = a.displayOrder ?? a.order ?? a.id ?? 0;
                              const orderB = b.displayOrder ?? b.order ?? b.id ?? 0;
                              return orderA - orderB;
                            });
                            const currentIndex = sortedChildren.findIndex((child) => child.id === c.id);
                            const isFirst = currentIndex === 0;
                            const isLast = currentIndex === sortedChildren.length - 1;
                            
                            return (
                              <div
                                key={c.id}
                                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden group"
                              >
                                {/* Görsel */}
                                <div className="relative h-32 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                  {c.imageUrl ? (
                                    <img
                                      src={c.imageUrl}
                                      alt={t?.title || "Ürün görseli"}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ImageIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                  )}
                                  {/* Durum Badge */}
                                  <div className="absolute top-2 right-2 z-10">
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        c.active
                                          ? "bg-green-500 text-white"
                                          : "bg-red-500 text-white"
                                      }`}
                                    >
                                      {c.active ? "Aktif" : "Pasif"}
                                    </span>
                                  </div>
                                </div>

                                {/* İçerik */}
                                <div className="p-3">
                                  <h5 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 truncate">
                                    {t?.title || "(İsim yok)"}
                                  </h5>
                                  {t?.description && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                                      {stripHTML(t.description)}
                                    </div>
                                  )}

                                  {/* Butonlar */}
                                  <div className="flex items-center gap-2 mt-3">
                                    {/* Sıralama butonları - Ana ürünlerdeki gibi sağ tarafta */}
                                    <div className="flex flex-col gap-0.5 ml-auto">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (!isFirst) {
                                            handleReorderChild(c.id, "up");
                                          }
                                        }}
                                        disabled={isFirst}
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Yukarı Taşı"
                                      >
                                        <ArrowUp size={12} />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (!isLast) {
                                            handleReorderChild(c.id, "down");
                                          }
                                        }}
                                        disabled={isLast}
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Aşağı Taşı"
                                      >
                                        <ArrowDown size={12} />
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => openEditChildModal(c)}
                                      className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-2 py-1.5 rounded-md text-xs font-medium transition-colors"
                                      title="Düzenle"
                                    >
                                      <Edit3 size={12} />
                                      Düzenle
                                    </button>
                                    <button
                                      onClick={() => toggleChildActive(c.id)}
                                      className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                        c.active
                                          ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                                          : "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                                      }`}
                                      title={c.active ? "Pasif Yap" : "Aktif Yap"}
                                    >
                                      {c.active ? <EyeOff size={12} /> : <Eye size={12} />}
                                    </button>
                                    <button
                                      onClick={() => deleteChild(c.id)}
                                      className="px-2 py-1.5 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-md text-xs font-medium transition-colors"
                                      title="Sil"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                          Henüz alt ürün yok
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mb-4">
                          Alt ürün eklemek için yukarıdaki butonu kullanın
                        </p>
                        <button
                          onClick={addChild}
                          disabled={!form.id}
                          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Plus size={16} />
                          İlk Alt Ürünü Ekle
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tabs Form */}
              <div className="mb-8">
                <TabsForm
                  form={form}
                  setForm={setForm}
                  handleUpload={handleUpload}
                  language={language}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 dark:bg-gray-800 px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
                  {form.id && (
                    <>
                      <button
                        onClick={removeProduct}
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors"
                      >
                        <Trash2 size={16} />
                        Sil
                      </button>
                      <button
                        onClick={toggleActive}
                        className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors"
                      >
                        {form.active ? "Pasif Yap" : "Aktif Yap"}
                      </button>
                    </>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
                  <button
                    onClick={startNew}
                    className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors"
                  >
                    <Plus size={16} />
                    Yeni Ürün
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 disabled:bg-green-400 dark:disabled:bg-green-600 text-white px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors"
                  >
                    <Save size={16} className={saving ? "animate-spin" : ""} />
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alt Ürün Modal */}
      {childModalOpen && (
        <ChildProductModal
          child={editingChild}
          parentId={form.id}
          language={language}
          onClose={closeChildModal}
          onSave={saveChild}
          onUpload={handleUpload}
          saving={saving}
        />
      )}
    </div>
  );
}

// ----------------- TABS COMPONENTS -----------------
function FeaturesTab({ features = [], update, language }) {
  const [list, setList] = useState([]);
  const [selectedFrequency, setSelectedFrequency] = useState(null);
  const [customFrequency, setCustomFrequency] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Features prop'unu logla
  useEffect(() => {
    console.log("📋 FeaturesTab - features prop:", features);
    console.log("📋 FeaturesTab - features array length:", features?.length || 0);
    console.log("📋 FeaturesTab - language:", language);
  }, [features, language]);

  useEffect(() => {
    console.log("🔄 FeaturesTab useEffect çalışıyor, features:", features);
    const currentLanguageFeatures = (features || [])
      .filter((f) => !f.langCode || f.langCode === language);
    
    console.log("🔄 FeaturesTab - currentLanguageFeatures:", currentLanguageFeatures);
    
    // Mevcut özelliklerden Hz değerlerini bul
    const frequencies = [
      ...new Set(
        currentLanguageFeatures
          .map((f) => f.frequency)
          .filter((f) => f !== null && f !== undefined)
      ),
    ].sort((a, b) => a - b);
    
    // Sadece ilk yüklemede varsayılan Hz'i ayarla (kullanıcı manuel seçim yapmadıysa)
    if (!isInitialized) {
      if (frequencies.length > 0) {
        setSelectedFrequency(frequencies[0]);
      } else {
        // Eğer hiç Hz yoksa, null (Hz Yok) moduna geç
        setSelectedFrequency(null);
      }
      setIsInitialized(true);
    }
    
    // Seçili Hz'e ait özellikleri göster
    const filteredFeatures = selectedFrequency !== null
      ? currentLanguageFeatures.filter((f) => f.frequency === selectedFrequency)
      : currentLanguageFeatures.filter((f) => f.frequency === null || f.frequency === undefined);
    
    setList(
      filteredFeatures.map((f) => ({
        langCode: f.langCode || language,
        name: f.name || f.featureName || f.title || "",
        value: f.value || f.featureValue || f.description || "",
        frequency: f.frequency || null,
      }))
    );
  }, [features, language, selectedFrequency, isInitialized]);

  const pushUpdate = (updatedListForCurrentFrequency) => {
    // Diğer dillerdeki özellikleri koru
    const otherLanguageFeatures = (features || []).filter(
      (f) => f.langCode && f.langCode !== language
    );
    
    // Mevcut dildeki diğer Hz'lerin özelliklerini koru
    const currentLanguageOtherFrequencies = (features || [])
      .filter((f) => 
        (!f.langCode || f.langCode === language) && 
        f.frequency !== selectedFrequency
      );
    
    // Güncellenmiş listeyi birleştir
    update([
      ...otherLanguageFeatures,
      ...currentLanguageOtherFrequencies,
      ...updatedListForCurrentFrequency.map((f) => ({
        langCode: f.langCode,
        name: f.name,
        value: f.value,
        frequency: f.frequency || null,
      })),
    ]);
  };

  const handleFrequencyChange = (newFrequency) => {
    setSelectedFrequency(newFrequency);
    setShowCustomInput(false);
    setCustomFrequency("");
    // Listeyi güncellemek için useEffect tetiklenecek
  };

  const handleAddCustomFrequency = () => {
    const freq = parseInt(customFrequency);
    if (!isNaN(freq) && freq > 0 && !availableFrequencies.includes(freq)) {
      // Yeni Hz'i seç
      setSelectedFrequency(freq);
      setShowCustomInput(false);
      setCustomFrequency("");
      // useEffect otomatik olarak list'i güncelleyecek (yeni Hz için boş liste)
      // pushUpdate çağrılmasına gerek yok çünkü henüz özellik eklenmedi
    }
  };

  // Mevcut Hz değerlerini bul (tüm özelliklerden, sadece mevcut listeden değil)
  const currentLanguageFeatures = (features || [])
    .filter((f) => !f.langCode || f.langCode === language);
  const frequenciesFromFeatures = [
    ...new Set(
      currentLanguageFeatures
        .map((f) => f.frequency)
        .filter((f) => f !== null && f !== undefined)
    ),
  ];
  
  // Eğer selectedFrequency features'da yoksa (yeni eklenen Hz), onu da ekle
  const availableFrequencies = [
    ...new Set([
      ...frequenciesFromFeatures,
      ...(selectedFrequency !== null && !frequenciesFromFeatures.includes(selectedFrequency) 
        ? [selectedFrequency] 
        : [])
    ])
  ].sort((a, b) => a - b);

  const addFeature = () => {
    const f = { langCode: language, name: "", value: "", frequency: selectedFrequency };
    const updated = [...list, f];
    setList(updated);
    pushUpdate(updated);
  };
  const updateFeature = (i, field, value) => {
    const updated = list.map((f, idx) =>
      idx === i ? { ...f, [field]: value } : f
    );
    setList(updated);
    pushUpdate(updated);
  };
  const removeFeature = (i) => {
    const updated = list.filter((_, idx) => idx !== i);
    setList(updated);
    pushUpdate(updated);
  };

  return (
    <div className="space-y-4">
      {/* Hz Seçici - Özellikler Tab'ının Hemen Altında */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Frekans (Hz) Seçin - Bu frekans için özellikleri düzenleyin
        </label>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Sadece mevcut Hz'leri göster */}
          {availableFrequencies.map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => handleFrequencyChange(freq)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedFrequency === freq
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
            >
              {freq} Hz
            </button>
          ))}
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="px-4 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-all"
            >
              + Özel Hz Ekle
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                placeholder="Hz değeri"
                value={customFrequency}
                onChange={(e) => setCustomFrequency(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustomFrequency();
                  }
                }}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddCustomFrequency}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ekle
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomFrequency("");
                }}
                className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                İptal
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => handleFrequencyChange(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedFrequency === null
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
            }`}
          >
            Hz Yok
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          {selectedFrequency !== null ? (
            <>
              Seçili frekans: <strong>{selectedFrequency} Hz</strong> - Bu frekans için <strong>{list.length}</strong> özellik var
            </>
          ) : (
            <>
              Seçili: <strong>Hz Yok</strong> - Frekans belirtilmemiş özellikler için <strong>{list.length}</strong> özellik var
            </>
          )}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Henüz özellik eklenmemiş
          </p>
          <p className="text-gray-400 text-sm">
            Ürün özelliklerini eklemek için aşağıdaki butonu kullanın
          </p>
        </div>
      ) : (
        list.map((f, i) => (
          <div
            key={i}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Özellik Adı
                </label>
                <input
                  placeholder="Özellik adını girin..."
                  value={f.name}
                  onChange={(e) => updateFeature(i, "name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Değer
                </label>
                <input
                  placeholder="Özellik değerini girin..."
                  value={f.value}
                  onChange={(e) => updateFeature(i, "value", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {f.frequency !== null && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Bu özellik <strong>{f.frequency} Hz</strong> frekansına bağlı
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => removeFeature(i)}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                <Trash2 size={14} />
                Sil
              </button>
            </div>
          </div>
        ))
      )}
      <button
        onClick={addFeature}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors"
      >
        <Plus size={16} />
        Özellik Ekle
      </button>
    </div>
  );
}

function CatalogsTab({ catalogs = [], update, handleUpload }) {
  const [list, setList] = useState(
    (catalogs || []).map((c) => ({
      name: c.name || "",
      fileUrl: c.fileUrl || c.file_url || c.url || "",
    }))
  );
  useEffect(
    () =>
      setList(
        (catalogs || []).map((c) => ({
          name: c.name || "",
          fileUrl: c.fileUrl || c.file_url || c.url || "",
        }))
      ),
    [catalogs]
  );

  const addCatalog = async (file) => {
    if (!file) return;
    await handleUpload(file, (url) => {
      const newCatalog = { name: file.name, fileUrl: url };
      const updated = [...list, newCatalog];
      setList(updated);
      update(updated);
    });
  };
  const updateCatalogName = (index, name) => {
    const updated = list.map((c, i) => (i === index ? { ...c, name } : c));
    setList(updated);
    update(updated);
  };
  const removeCatalog = (index) => {
    const updated = list.filter((_, i) => i !== index);
    setList(updated);
    update(updated);
  };

  return (
    <div className="space-y-4">
      {list.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Henüz katalog eklenmemiş
          </p>
          <p className="text-gray-400 text-sm">
            Ürün kataloglarını eklemek için aşağıdaki butonu kullanın
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((c, i) => (
            <div
              key={i}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={c.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium text-sm truncate block"
                    >
                      {c.name || c.fileUrl.split("/").pop()}
                    </a>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {c.fileUrl.split("/").pop()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeCatalog(i)}
                  className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-shrink-0"
                >
                  <Trash2 size={14} />
                  Sil
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Katalog İsmi
                </label>
                <input
                  type="text"
                  placeholder="Katalog ismini girin..."
                  value={c.name}
                  onChange={(e) => updateCatalogName(i, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <label className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        Katalog Yükle
        <input
          type="file"
          className="hidden"
          onChange={async (e) => addCatalog(e.target.files[0])}
        />
      </label>
    </div>
  );
}

function TabsForm({ form, setForm, handleUpload, language }) {
  const [activeTab, setActiveTab] = useState("features");
  
  // Form.features'i logla
  useEffect(() => {
    console.log("📊 TabsForm - form.features:", form.features);
    console.log("📊 TabsForm - form.features length:", form.features?.length || 0);
    console.log("📊 TabsForm - activeTab:", activeTab);
  }, [form.features, activeTab]);
  
  return (
    <div>
      <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-orange-500 rounded"></div>
        Ek Bilgiler
      </h4>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("features")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "features"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Özellikler
            </div>
          </button>
          <button
            onClick={() => setActiveTab("catalogs")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "catalogs"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Kataloglar
            </div>
          </button>
        </div>
        <div className="p-6">
          {activeTab === "features" && (
            <FeaturesTab
              features={form.features}
              update={(f) => setForm((prev) => ({ ...prev, features: f }))}
              language={language}
            />
          )}
          {activeTab === "catalogs" && (
            <CatalogsTab
              catalogs={form.catalogs}
              update={(c) => setForm((prev) => ({ ...prev, catalogs: c }))}
              handleUpload={handleUpload}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------- CHILD PRODUCT MODAL -----------------
function ChildProductModal({
  child,
  parentId,
  language,
  onClose,
  onSave,
  onUpload,
  saving,
}) {
  const emptyChild = () => ({
    id: null,
    imageUrl: "",
    active: true,
    parentId: parentId,
    translations: [{ 
      langCode: language, 
      title: "", 
      description: "", 
      slug: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      seoOgTitle: "",
      seoOgDescription: "",
      seoOgImage: "",
    }],
    features: [],
    catalogs: [],
    children: [],
  });

  const [childForm, setChildForm] = useState(child ? { ...child } : emptyChild());
  const [activeTab, setActiveTab] = useState("features");

  useEffect(() => {
    if (child) {
      setChildForm({ ...child });
    } else {
      const newChild = {
        id: null,
        imageUrl: "",
        active: true,
        parentId: parentId,
        translations: [{ 
      langCode: language, 
      title: "", 
      description: "", 
      slug: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      seoOgTitle: "",
      seoOgDescription: "",
      seoOgImage: "",
    }],
        features: [],
        catalogs: [],
        children: [],
      };
      setChildForm(newChild);
    }
  }, [child, parentId, language]);

  const translationForLang = (translations = []) =>
    translations.find((t) => t.langCode === language) || {
      langCode: language,
      title: "",
      description: "",
      slug: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      seoOgTitle: "",
      seoOgDescription: "",
      seoOgImage: "",
    };

  const handleSave = () => {
    onSave(childForm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10 dark:bg-opacity-20 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {child ? "Alt Ürün Düzenle" : "Yeni Alt Ürün Ekle"}
            </h2>
            <p className="text-sm text-purple-100 mt-1">
              {child?.id ? `ID: ${child.id}` : "Yeni alt ürün oluşturun"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Temel Bilgiler */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-500 rounded"></div>
              Temel Bilgiler
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Başlık */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Ürün Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Alt ürün başlığını girin..."
                  value={translationForLang(childForm.translations).title}
                  onChange={(e) => {
                    const t = translationForLang(childForm.translations);
                    setChildForm((prev) => ({
                      ...prev,
                      translations: [
                        ...prev.translations.filter((x) => x.langCode !== language),
                        { ...t, title: e.target.value, langCode: language },
                      ],
                    }));
                  }}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Slug (SEO URL)
                </label>
                <input
                  type="text"
                  placeholder="alt-urun-slug"
                  value={translationForLang(childForm.translations).slug}
                  onChange={(e) => {
                    const t = translationForLang(childForm.translations);
                    setChildForm((prev) => ({
                      ...prev,
                      translations: [
                        ...prev.translations.filter((x) => x.langCode !== language),
                        { ...t, slug: e.target.value, langCode: language },
                      ],
                    }));
                  }}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Açıklama */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Açıklama
              </label>
              <RichTextEditor
                value={translationForLang(childForm.translations).description || ""}
                onChange={(value) => {
                  const t = translationForLang(childForm.translations);
                  setChildForm((prev) => ({
                    ...prev,
                    translations: [
                      ...prev.translations.filter((x) => x.langCode !== language),
                      { ...t, description: value, langCode: language },
                    ],
                  }));
                }}
                placeholder="Alt ürün açıklamasını girin..."
              />
            </div>

            {/* Görsel ve Aktif/Pasif */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Görsel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Görsel
                </label>
                {childForm.imageUrl ? (
                  <div className="relative">
                    <img
                      src={childForm.imageUrl}
                      alt="Ürün görseli"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                    <button
                      onClick={() =>
                        setChildForm((prev) => ({ ...prev, imageUrl: "" }))
                      }
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-md"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg items-center justify-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files[0]) {
                          await onUpload(e.target.files[0], (url) => {
                            setChildForm((prev) => ({ ...prev, imageUrl: url }));
                          });
                        }
                      }}
                    />
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Görsel Seç
                      </span>
                    </div>
                  </label>
                )}
              </div>

              {/* Aktif/Pasif */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Durum
                </label>
                <button
                  onClick={() =>
                    setChildForm((prev) => ({ ...prev, active: !prev.active }))
                  }
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    childForm.active
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700"
                  }`}
                >
                  {childForm.active ? (
                    <span className="flex items-center justify-center gap-2">
                      <Eye size={16} />
                      Aktif
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <EyeOff size={16} />
                      Pasif
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Özellikler ve Kataloglar */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-orange-500 rounded"></div>
              Ek Bilgiler
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab("features")}
                  className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "features"
                      ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  Özellikler
                </button>
                <button
                  onClick={() => setActiveTab("catalogs")}
                  className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "catalogs"
                      ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  Kataloglar
                </button>
              </div>
              <div className="p-6">
                {activeTab === "features" && (
                  <FeaturesTab
                    features={childForm.features}
                    update={(f) =>
                      setChildForm((prev) => ({ ...prev, features: f }))
                    }
                    language={language}
                  />
                )}
                {activeTab === "catalogs" && (
                  <CatalogsTab
                    catalogs={childForm.catalogs}
                    update={(c) =>
                      setChildForm((prev) => ({ ...prev, catalogs: c }))
                    }
                    handleUpload={onUpload}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 disabled:bg-purple-400 dark:disabled:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Save size={16} className={saving ? "animate-spin" : ""} />
            {saving ? "Kaydediliyor..." : child ? "Güncelle" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}
  