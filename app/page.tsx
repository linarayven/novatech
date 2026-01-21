export default function Home() {
  return (
    <section>
      <h1 className="text-4xl font-bold mb-4 text-blue-600">
        NovaTech
      </h1>

      <p className="text-gray-600 text-lg">
        Сучасний інтернет-магазин електроніки
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">Ноутбуки</div>
        <div className="p-4 border rounded-lg">Телефони</div>
        <div className="p-4 border rounded-lg">Телевізори</div>
        <div className="p-4 border rounded-lg">Аксесуари</div>
      </div>
    </section>
  );
}
