import { supabase } from "@/lib/supabase";

export default async function Home() {
  // Получаем все товары
  const { data: products } = await supabase.from("products").select("*");

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6 text-blue-600">NovaTech</h1>
      <p className="text-gray-700 mb-8">Сучасний інтернет-магазин електроніки</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {products?.map((product) => (
          <div key={product.id} className="border p-4 rounded shadow hover:shadow-lg transition">
            <h2 className="font-bold mb-2">{product.title}</h2>
            <p className="text-gray-600 mb-1">Ціна: {product.price} грн</p>
            <p className="text-gray-500 text-sm">Категорія: {product.category}</p>
            {product.brand && <p className="text-gray-500 text-sm">Бренд: {product.brand}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
