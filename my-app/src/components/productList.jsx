import { useEffect, useState } from 'react';

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const handleBuy = async (product) => {
    const res = await fetch('http://localhost:5000/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    const data = await res.json();
    window.location = data.url;
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {products.map(p => (
        <div key={p.id} className="border p-2 rounded shadow">
          <img src={p.image} alt={p.name} className="w-full h-40 object-cover" />
          <h2 className="text-lg font-semibold">{p.name}</h2>
          <p>{p.category}</p>
          <p className="text-green-600">{p.price} €</p>
          <button
            onClick={() => handleBuy(p)}
            className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
          >
            Acheter
          </button>
        </div>
      ))}
    </div>
  );
}
