# Backend Değişiklikleri - Ürün Parent/Child Yönetimi

## Özet
Frontend'de ürünlerin parentId'sini değiştirebilmek için dropdown eklendi. Backend'de de bu değişikliği desteklemek ve circular reference'ları önlemek için aşağıdaki değişikliklerin yapılması gerekiyor.

## Yapılması Gerekenler

### 1. Product Save Endpoint Güncellemesi

`/api/nikutek/products/save` endpoint'inde parentId değişikliğini desteklemek için:

- **Mevcut durum kontrolü**: Eğer ürün zaten bir parentId'ye sahipse ve yeni parentId farklıysa, bu değişikliği kabul etmelidir.
- **Null parentId desteği**: parentId null olarak gönderildiğinde, ürünü ana ürün yapmalıdır (alt ürün → ana ürün dönüşümü).

### 2. Circular Reference Kontrolü

Bir ürün kendi alt ürününün alt ürünü olamaz. Bu kontrolü eklemek için:

```java
// Örnek Java kodu (Spring Boot için)
private void validateParentId(Long productId, Long newParentId) {
    if (newParentId == null) {
        return; // Ana ürün olabilir
    }
    
    if (productId != null && productId.equals(newParentId)) {
        throw new IllegalArgumentException("Bir ürün kendi parent'ı olamaz");
    }
    
    // Circular reference kontrolü: 
    // Yeni parent'ın, mevcut ürünün alt ürünü olup olmadığını kontrol et
    Product newParent = productRepository.findById(newParentId)
        .orElseThrow(() -> new EntityNotFoundException("Parent ürün bulunamadı"));
    
    // Yeni parent'ın parentId'si mevcut ürünün id'si ise circular reference var
    if (newParent.getParentId() != null && newParent.getParentId().equals(productId)) {
        throw new IllegalArgumentException("Circular reference: Bu ürün zaten seçilen parent'ın alt ürünü");
    }
    
    // Daha derin circular reference kontrolü için recursive kontrol
    if (isDescendantOf(productId, newParentId)) {
        throw new IllegalArgumentException("Circular reference: Bu ürün seçilen parent'ın alt ürünü");
    }
}

private boolean isDescendantOf(Long ancestorId, Long descendantId) {
    if (ancestorId == null || descendantId == null) {
        return false;
    }
    
    Product current = productRepository.findById(descendantId).orElse(null);
    while (current != null && current.getParentId() != null) {
        if (current.getParentId().equals(ancestorId)) {
            return true;
        }
        current = productRepository.findById(current.getParentId()).orElse(null);
    }
    return false;
}
```

### 3. Product Entity/Model Güncellemesi

Product entity'sinde parentId alanının güncellenebilir olduğundan emin olun:

- `parentId` alanı nullable olmalı
- `parentId` değişikliği cascade delete'i etkilememeli (alt ürünler silinmemeli)

### 4. API Response

Save endpoint'i parentId'yi response'da döndürmelidir:

```json
{
  "id": 123,
  "parentId": null,  // veya bir parent ID
  "imageUrl": "...",
  "active": true,
  ...
}
```

### 5. Test Senaryoları

Aşağıdaki senaryolar test edilmelidir:

1. ✅ Ana ürünü alt ürüne çevirme (parentId: null → bir ID)
2. ✅ Alt ürünü ana ürüne çevirme (parentId: bir ID → null)
3. ✅ Alt ürünün parent'ını değiştirme (parentId: ID1 → ID2)
4. ❌ Bir ürünü kendi alt ürününün alt ürünü yapma (circular reference)
5. ❌ Bir ürünü kendi parent'ı yapma (circular reference)

## Frontend'de Yapılan Değişiklikler

Frontend'de (`src/components/admin/ProductControl.jsx`):
- Temel Bilgiler bölümüne "Ana Ürün Seçimi" dropdown'ı eklendi
- Dropdown'da sadece ana ürünler (parentId null olanlar) gösteriliyor
- Mevcut ürün ve alt ürünleri dropdown'dan hariç tutuluyor (circular reference önleme)
- "Yok (Ana Ürün)" seçeneği ile alt ürünü ana ürüne çevirme mümkün

## Notlar

- Backend'de children array'ini save endpoint'ine göndermek gerekli değil, sadece parentId yeterli
- Frontend'de children array'i sadece görüntüleme amaçlı kullanılıyor
- parentId değişikliği yapıldığında, ürünün mevcut alt ürünleri etkilenmemeli (onlar kendi parentId'lerini korumalı)

