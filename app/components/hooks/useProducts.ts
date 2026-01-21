import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Product } from '@/src/lib/filters';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: productsError } = await supabase.from("products").select("*");
        if (productsError) {
          console.error("Помилка завантаження:", productsError);
          setError("Не вдалося завантажити товари");
          setProducts([]);
        } else {
          setProducts(data || []);
        }
      } catch (err) {
        console.error("Помилка:", err);
        setError("Помилка завантаження даних");
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);

  return { products, loading, error };
};