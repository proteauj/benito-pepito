'use client';

import { useState } from 'react';

export default function UpdateStockPage() {
  const [productIds, setProductIds] = useState('pa5');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const markAsSold = async () => {
    const ids = productIds.split(',').map(id => id.trim()).filter(id => id);
    if (ids.length === 0) {
      setResult('❌ Veuillez entrer au moins un ID de produit');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/update-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: ids,
          inStock: false
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Success: ${data.message}
Produits mis à jour: ${data.updatedProducts}
IDs: ${JSON.stringify(data.productIds)}`);
      } else {
        setResult(`❌ Error: ${data.error}
Details: ${data.details || 'No details available'}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const markAsAvailable = async () => {
    const ids = productIds.split(',').map(id => id.trim()).filter(id => id);
    if (ids.length === 0) {
      setResult('❌ Veuillez entrer au moins un ID de produit');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/update-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: ids,
          inStock: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Success: ${data.message}
Produits mis à jour: ${data.updatedProducts}
IDs: ${JSON.stringify(data.productIds)}`);
      } else {
        setResult(`❌ Error: ${data.error}
Details: ${data.details || 'No details available'}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papiers');
  };

  return (
    <div className="min-h-screen flex items-center justify-center stoneBg p-8">
      <div className="bg-white/95 border border-[#cfc9c0] shadow px-8 py-6 text-center w-full max-w-lg">
        <h1 className="text-3xl font-bold text-black mb-4">📦 Mise à jour manuelle du stock</h1>
        <p className="text-black/70 mb-6">
          Mettez à jour le statut des produits qui étaient dans le panier
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-black mb-2">
            IDs des produits (séparés par des virgules)
          </label>
          <textarea
            value={productIds}
            onChange={(e) => setProductIds(e.target.value)}
            placeholder="pa5, sc1, pt2"
            className="w-full px-4 py-2 border border-[#cfc9c0] rounded-sm focus:outline-none focus:ring-2 focus:ring-[var(--leaf)] h-20 resize-none"
          />
          <p className="text-xs text-black/50 mt-1">
            Exemple: pa5 (pour "Cement on cardboard")
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={markAsSold}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 px-6 font-semibold hover:bg-red-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Mise à jour...' : 'Marquer comme VENDU'}
          </button>

          <button
            onClick={markAsAvailable}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-6 font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Mise à jour...' : 'Marquer comme DISPONIBLE'}
          </button>
        </div>

        {result && (
          <div className="mb-6">
            <div className="p-4 bg-gray-100 rounded-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-black">Résultat :</h3>
                <button
                  onClick={() => copyToClipboard(result)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  📋 Copier
                </button>
              </div>
              <pre className="text-sm text-left whitespace-pre-wrap font-mono text-black/70">
                {result}
              </pre>
            </div>
          </div>
        )}

        <div className="text-left bg-blue-50 border border-blue-200 p-4 rounded-sm">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Comment utiliser :</h3>
          <ol className="text-blue-700 text-sm space-y-1">
            <li>1. Entrez les IDs des produits qui étaient dans le panier</li>
            <li>2. Cliquez sur "Marquer comme VENDU"</li>
            <li>3. Vérifiez que le stock est mis à jour dans products.ts</li>
            <li>4. Les produits afficheront "Vendu" au lieu de "Ajouter au panier"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
