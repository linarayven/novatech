// Типі (совместим з існуючими типами)
export interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  brand?: string;
  sub_category?: string;
  description?: string;
  image_url?: string;
  specs?: Record<string, string | number | boolean>;
  created_at?: string;
}

/**
 * Нормалізує значення для уніфікованого порівняння та дедупліцірення
 * isStorage - чи це значення для Storage (щоб додати SSD)
 */
const normalizeValue = (value: string, isStorage: boolean = false): string => {
  if (!value) return '';
  
  let normalized = value.trim().replace(/\s+/g, ' ');
  
  // Видаляємо пробіл між числом та одиницею
  normalized = normalized.replace(/(\d+)\s+(GB|TB|ГБ|ТБ)/gi, '$1$2');
  normalized = normalized.replace(/(\d+)\s+(GB|ГБ)\s+RAM/gi, '$1GB RAM');
  normalized = normalized.replace(/(\d+)\s+(GB|ГБ)\s+SSD/gi, '$1GB SSD');
  normalized = normalized.replace(/(\d+)\s+(TB)\s+SSD/gi, '$1TB SSD');
  
  // Стандартизуємо ТБ → TB, ГБ → GB
  normalized = normalized.replace(/ТБ/gi, 'TB');
  normalized = normalized.replace(/ГБ/gi, 'GB');
  
  // КЛЮЧОВО: Додаємо SSD тільки для Storage значень
  // "256GB" → "256GB SSD" (щоб збігалося з "256GB SSD")
  if (isStorage && /^\d+(GB|TB)$/.test(normalized)) {
    normalized = normalized + ' SSD';
  }
  
  return normalized;
};

export const extractSpecsFromJSON = (specs: Record<string, any>) => {
  if (!specs || typeof specs !== 'object') return {};
  
  const result: Record<string, string[]> = {};
  
  Object.entries(specs).forEach(([key, value]) => {
    if (!value) return;
    
    let normalizedKey = key;
    
    if (['RAM', 'Memory', 'VRAM'].includes(key)) {
      normalizedKey = 'RAM';
    }
    else if (['Storage', 'Disk', 'HDD', 'SSD'].includes(key)) {
      normalizedKey = 'Storage';
    }
    else if (['Display', 'ScreenSize', 'Screen', 'Size'].includes(key)) {
      normalizedKey = 'Screen Size';
    }
    else if (['Processor', 'CPU', 'Chipset'].includes(key)) {
      normalizedKey = 'Processor';
    }
    else if (['GPU', 'GraphicsCard', 'Graphics'].includes(key)) {
      normalizedKey = 'GPU';
    }
    else if (['Panel', 'Type'].includes(key)) {
      normalizedKey = 'Panel Type';
    }
    else if (['Resolution'].includes(key)) {
      normalizedKey = 'Resolution';
    }
    else if (['Battery', 'BatteryLife', 'Capacity'].includes(key)) {
      normalizedKey = 'Battery';
    }
    else if (['RefreshRate', 'Refresh'].includes(key)) {
      normalizedKey = 'Refresh Rate';
    }
    
    if (!result[normalizedKey]) {
      result[normalizedKey] = [];
    }
    
    // Передаємо isStorage=true тільки для Storage
    const isStorage = normalizedKey === 'Storage';
    const normalizedValue = normalizeValue(String(value), isStorage);
    
    if (normalizedValue && !result[normalizedKey].includes(normalizedValue)) {
      result[normalizedKey].push(normalizedValue);
    }
  });
  
  return result;
};

/**
 * Отримання всіх доступних специфікацій з товарів
 * ВАЖНО: Тепер фільтрує товари за категорією перед видобуванням фільтрів
 */
export const getAllAvailableSpecs = (
  filteredProducts: Product[], 
  category?: string | null,
  subCategory?: string | null
) => {
  // Фільтруємо товари за категорією якщо вона вказана
  let productsToProcess = filteredProducts;
  if (category) {
    productsToProcess = productsToProcess.filter(p => p.category === category);
  }
  
  // Фільтруємо товари за брендом якщо він вказаний
  if (subCategory) {
    productsToProcess = productsToProcess.filter(p => p.brand === subCategory);
  }

  const allSpecs: Record<string, Set<string>> = {};
  
  productsToProcess.forEach((product) => {
    const specs = extractSpecsFromJSON(product.specs || {});
    
    Object.entries(specs).forEach(([key, values]) => {
      if (!allSpecs[key]) {
        allSpecs[key] = new Set();
      }
      
      (values || []).forEach((v) => {
        if (v && typeof v === 'string') {
          // Для дедупліцірення також передаємо isStorage
          const isStorage = key === 'Storage';
          const normalized = normalizeValue(v, isStorage);
          allSpecs[key].add(normalized);
        }
      });
    });
  });

  // Сортуємо значення в кожній групі
  const sortedSpecs: Record<string, Set<string>> = {};
  Object.entries(allSpecs).forEach(([key, valueSet]) => {
    const sortedArray = Array.from(valueSet).sort((a, b) => {
      // Спеціальне сортування для розмірів: 3GB < 8GB < 16GB < 32GB
      const aMatch = a.match(/^(\d+)(GB|TB)?/);
      const bMatch = b.match(/^(\d+)(GB|TB)?/);
      
      if (aMatch && bMatch) {
        const aNum = parseInt(aMatch[1]);
        const bNum = parseInt(bMatch[1]);
        
        if (aNum !== bNum) {
          return aNum - bNum;
        }
      }
      
      return a.localeCompare(b);
    });
    
    sortedSpecs[key] = new Set(sortedArray);
  });

  return sortedSpecs;
};

export const applyFilters = (
  productsToFilter: Product[],
  priceRange: [number, number],
  selectedSpecs: Record<string, Set<string>>,
  sortBy: "price-asc" | "price-desc" | "name" | "newest",
  category?: string | null,
  subCategory?: string | null
) => {
  let filtered = [...productsToFilter];

  // Фільтруємо за категорією на початку
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  // Фільтруємо за брендом (підкатегорією)
  if (subCategory) {
    filtered = filtered.filter(p => p.brand === subCategory);
  }

  filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

  filtered = filtered.filter((product) => {
    const productSpecs = extractSpecsFromJSON(product.specs || {});
    
    return Object.entries(selectedSpecs).every(([key, selectedValues]) => {
      if (!selectedValues || selectedValues.size === 0) return true;
      
      const productSpecValues = productSpecs[key] || [];
      
      return Array.from(selectedValues).some((selectedValue) =>
        productSpecValues.some((specValue) => {
          const isStorage = key === 'Storage';
          const normalizedSelected = normalizeValue(selectedValue, isStorage);
          const normalizedSpec = normalizeValue(specValue, isStorage);
          
          return normalizedSpec.toLowerCase().includes(normalizedSelected.toLowerCase());
        })
      );
    });
  });

  switch (sortBy) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "name":
      filtered.sort((a, b) => a.title.localeCompare(b.title, "uk"));
      break;
    case "newest":
      filtered.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
      break;
  }

  return filtered;
};

export const debugExtractSpecs = (specs: Record<string, any>) => {
  console.log("Input specs:", specs);
  const result = extractSpecsFromJSON(specs);
  console.log("Extracted/Grouped:", result);
  return result;
};

export const parseSpecsIfString = (specs: any): Record<string, any> => {
  if (typeof specs === 'string') {
    try {
      return JSON.parse(specs);
    } catch (e) {
      console.warn("Failed to parse specs JSON:", e);
      return {};
    }
  }
  return specs || {};
};