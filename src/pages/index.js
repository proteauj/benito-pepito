// pages/index.js
import { useState } from "react";

const PRODUCTS = [
  { id: "p1", name: "Taco Benito", price: 7.5 },
  { id: "p2", name: "Combo Pepito", price: 15.0 }
];

export default function Home() {
  const [cart, setCart] = useState([]);

  function addToCart(product) {
    setCart(prev => {
      const found = prev.find(p => p.id === product.id);
      if (found) return prev.map(p => p.id === product.id ? {...p, quantity: p.quantity+1} : p);
      return [...prev, {...product, quantity: 1}];
    });
  }

  async function checkout() {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ items: cart })
    });
    const data = await res.json();
    if (data.url) window.location = data.url;
    else alert("Erreur lors du checkout");
  }

  return (
    <main style={{padding:20}}>
      <h1>Benito Pepito — Boutique</h1>
      <div style={{display:"flex",gap:20}}>
        {PRODUCTS.map(p => (
          <div key={p.id} style={{border:"1px solid #ddd",padding:10}}>
            <h3>{p.name}</h3>
            <p>${p.price.toFixed(2)}</p>
            <button onClick={() => addToCart(p)}>Ajouter</button>
          </div>
        ))}
      </div>

      <hr />

      <h2>Panier</h2>
      {cart.length === 0 ? <p>Vide</p> :
        <>
          <ul>
            {cart.map(c => <li key={c.id}>{c.name} x {c.quantity}</li>)}
          </ul>
          <button onClick={checkout}>Passer au paiement</button>
        </>
      }
      <footer style={{marginTop:40}}>
        <small>Contact : info@benitopepito.com</small>
      </footer>
    </main>
  );
}
