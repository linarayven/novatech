// Типы (совместим с существующими типами)
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

// Извлечение спецификаций из описания
export const extractSpecsFromDescription = (description: string) => {
  if (!description) return {};
  
  const specs: Record<string, Set<string>> = {};
  
  const patterns = [
    { key: "RAM", regex: /(\d+)\s*(GB|ГБ)\s*RAM/i },
    { key: "Storage", regex: /(\d+)\s*(GB|ТБ|TB)\s*(SSD|HDD)?/i },
    { key: "Display", regex: /(OLED|IPS|LCD|VA|TN)/i },
    { key: "Resolution", regex: /(\d+p|4K|8K|FHD|QHD|UHD)/i },
    { key: "Processor", regex: /(Intel|AMD|Snapdragon|Apple|M\d+|Core|Ryzen)/i },
    { key: "Battery", regex: /(\d+)mAh|(\d+)h\s*battery/i },
    { key: "Refresh Rate", regex: /(\d+)\s*Hz|(\d+)\s*FPS/i },
  ];

  patterns.forEach(({ key, regex }) => {
    const match = description.match(regex);
    if (match) {
      if (!specs[key]) specs[key] = new Set();
      specs[key].add(match[0]);
    }
  });

  const result: Record<string, string[]> = {};
  Object.entries(specs).forEach(([key, set]) => {
    result[key] = Array.from(set);
  });

  return result;
};

// Получение всех доступных спецификаций
export const getAllAvailableSpecs = (filteredProducts: Product[]) => {
  const allSpecs: Record<string, Set<string>> = {};
  
  filteredProducts.forEach((product) => {
    const specs = extractSpecsFromDescription(product.description || "");
    Object.entries(specs).forEach(([key, values]) => {
      if (!allSpecs[key]) allSpecs[key] = new Set();
      values.forEach((v) => allSpecs[key].add(v));
    });
  });

  const result: Record<string, string[]> = {};
  Object.entries(allSpecs).forEach(([key, set]) => {
    result[key] = Array.from(set);
  });

  return result;
};

// Применение фильтров
export const applyFilters = (
  productsToFilter: Product[],
  priceRange: [number, number],
  selectedSpecs: Record<string, string>,
  sortBy: "price-asc" | "price-desc" | "name" | "newest"
) => {
  let filtered = [...productsToFilter];

  // Фильтр по цене
  filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

  // Фильтр по параметрам
  filtered = filtered.filter((product) => {
    const productSpecs = extractSpecsFromDescription(product.description || "");
    
    return Object.entries(selectedSpecs).every(([key, value]) => {
      if (!value) return true;
      const specs = productSpecs[key] || [];
      return specs.some((spec) => spec.toLowerCase().includes(value.toLowerCase()));
    });
  });

  // Сортировка
  switch (sortBy) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "name":
      filtered.sort((a, b) => a.title.localeCompare(b.title));
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