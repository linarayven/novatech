import { supabase } from "@/lib/supabase";
import Image from "next/image";


export default async function Home() {
  // Получаем товары из Supabase
  const { data: products } = await supabase.from("products").select("*");

  // Категории для кнопок
  const categories = ["laptops", "phones", "tv", "accessories"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ====== Хедер ====== */}
      <header className="bg-white shadow p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">NovaTech</h1>

        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Пошук товарів..."
            className="border rounded px-3 py-1 focus:outline-blue-500"
          />
          <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition">
            Знайти
          </button>
        </div>

        <div className="flex gap-4">
          <button>👤</button>
          <button>🛒</button>
        </div>
      </header>

      {/* ====== Баннер ====== */}
      <div className="w-full h-48 bg-blue-400 text-white flex items-center justify-center text-3xl font-bold my-4 rounded">
        ВЕЛИКИЙ ЗИМОВИЙ РОЗПРОДАЖ ДО -55%
      </div>

      {/* ====== Категории ====== */}
      <div className="flex justify-center gap-4 my-4">
        {categories.map((cat) => (
          <button
            key={cat}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ====== Сетка товаров ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-4">
        {products?.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded shadow hover:shadow-lg transition"
          >
            {/* Если есть картинка, подключаем */}
            {product.image && (
              <Image
                src={product.image}
                alt={product.title}
                width={300}
                height={200}
                className="mb-2 rounded"
              />
            )}

            <h2 className="font-bold mb-1">{product.title}</h2>
            <p className="text-gray-600 mb-1">Ціна: {product.price} грн</p>
            <p className="text-gray-500 text-sm">Категорія: {product.category}</p>
            {product.brand && <p className="text-gray-500 text-sm">Бренд: {product.brand}</p>}

            <button className="mt-2 w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700 transition">
              Додати в корзину
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
