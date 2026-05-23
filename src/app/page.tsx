'use client';

import { useEffect, useState } from 'react';

interface InventoryItem {
  id: string;
  warehouseId: string;
  warehouseName: string;
  warehouseLocation: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  inventory: InventoryItem[];
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [reserveErrors, setReserveErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleQuantityChange(inventoryId: string, value: number) {
    setQuantities((prev) => ({ ...prev, [inventoryId]: value }));
    // clear any previous error for this row
    setReserveErrors((prev) => {
      const copy = { ...prev };
      delete copy[inventoryId];
      return copy;
    });
  }

  async function handleReserve(productId: string, warehouseId: string, inventoryId: string, available: number) {
    const qty = quantities[inventoryId] || 1;

    if (qty < 1 || qty > available) {
      setReserveErrors((prev) => ({ ...prev, [inventoryId]: `Quantity must be between 1 and ${available}` }));
      return;
    }

    setReservingId(inventoryId);
    setReserveErrors((prev) => {
      const copy = { ...prev };
      delete copy[inventoryId];
      return copy;
    });

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, warehouseId, quantity: qty }),
      });

      if (res.status === 409) {
        const data = await res.json();
        setReserveErrors((prev) => ({ ...prev, [inventoryId]: data.error || 'Not enough stock available' }));
        return;
      }

      if (!res.ok) {
        setReserveErrors((prev) => ({ ...prev, [inventoryId]: 'Failed to create reservation' }));
        return;
      }

      const reservation = await res.json();
      window.location.href = `/reservation/${reservation.id}`;
    } catch {
      setReserveErrors((prev) => ({ ...prev, [inventoryId]: 'Network error. Please try again.' }));
    } finally {
      setReservingId(null);
    }
  }

  if (loading) {
    return <p className="text-gray-500 text-center py-12">Loading products...</p>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="text-gray-500 text-center py-12">No products found.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-medium text-gray-900">{product.name}</h2>
            {product.description && (
              <p className="text-sm text-gray-500 mt-1">{product.description}</p>
            )}
            <p className="text-base font-semibold text-gray-800 mt-2">
              ${product.price.toFixed(2)}
            </p>

            {product.inventory.length === 0 ? (
              <p className="text-sm text-gray-400 mt-4">No stock available</p>
            ) : (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Warehouse Stock</h3>
                <div className="space-y-3">
                  {product.inventory.map((inv) => (
                    <div key={inv.id} className="border border-gray-100 rounded p-3 bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{inv.warehouseName}</span>
                        <span className="text-xs text-gray-500">
                          {inv.availableQuantity} available
                        </span>
                      </div>

                      {inv.availableQuantity > 0 ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={inv.availableQuantity}
                            value={quantities[inv.id] || 1}
                            onChange={(e) => handleQuantityChange(inv.id, parseInt(e.target.value) || 1)}
                            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                          <button
                            onClick={() => handleReserve(product.id, inv.warehouseId, inv.id, inv.availableQuantity)}
                            disabled={reservingId === inv.id}
                            className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {reservingId === inv.id ? 'Reserving...' : 'Reserve'}
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-red-500">Out of stock</p>
                      )}

                      {reserveErrors[inv.id] && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                          {reserveErrors[inv.id]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
