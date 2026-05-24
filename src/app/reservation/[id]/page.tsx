'use client';

import { use, useEffect, useState, useCallback } from 'react';

interface Reservation {
  id: string;
  quantity: number;
  status: 'PENDING' | 'CONFIRMED' | 'RELEASED';
  expiresAt: string;
  createdAt: string;
  inventory: {
    id: string;
    product: {
      id: string;
      name: string;
      description: string | null;
      price: number;
    };
    warehouse: {
      id: string;
      name: string;
      location: string;
    };
  };
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export default function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchReservation = useCallback(async () => {
    try {
      const res = await fetch(`/api/reservations/${id}`);
      if (res.status === 404) {
        setError('Reservation not found');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch reservation');
      const data = await res.json();
      setReservation(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReservation();
  }, [fetchReservation]);

  // countdown timer
  useEffect(() => {
    if (!reservation || reservation.status !== 'PENDING') return;

    function calcTimeLeft() {
      const expires = new Date(reservation!.expiresAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeLeft(remaining);
    }

    calcTimeLeft();
    const interval = setInterval(calcTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [reservation]);

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  async function handleConfirm() {
    setActionLoading(true);
    setActionError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/reservations/${id}/confirm`, { method: 'POST' });

      if (res.status === 410) {
        setActionError('Reservation has expired');
        await fetchReservation();
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setActionError(data.error || 'Failed to confirm reservation');
        return;
      }

      setSuccessMsg('Reservation confirmed successfully!');
      await fetchReservation();
    } catch {
      setActionError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    setActionLoading(true);
    setActionError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/reservations/${id}/release`, { method: 'POST' });

      if (!res.ok) {
        const data = await res.json();
        setActionError(data.error || 'Failed to cancel reservation');
        return;
      }

      setSuccessMsg('Reservation cancelled.');
      await fetchReservation();
    } catch {
      setActionError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'CONFIRMED':
        return <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">Confirmed</span>;
      case 'PENDING':
        return <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-amber-100 text-amber-800">Pending</span>;
      case 'RELEASED':
        return <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">Released</span>;
      default:
        return <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">{status}</span>;
    }
  }

  if (loading) {
    return <p className="text-gray-500 text-center py-12">Loading reservation...</p>;
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
        <a href="/" className="inline-block mt-4 text-blue-600 hover:underline text-sm">
          &larr; Back to products
        </a>
      </div>
    );
  }

  if (!reservation) return null;

  const isPending = reservation.status === 'PENDING';
  const isExpired = timeLeft !== null && timeLeft <= 0 && isPending;

  return (
    <div className="max-w-lg mx-auto">
      <a href="/" className="text-blue-600 hover:underline text-sm">
        &larr; Back to products
      </a>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Reservation</h1>
          {getStatusBadge(reservation.status)}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Product</p>
            <p className="font-medium text-gray-900">{reservation.inventory.product.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Warehouse</p>
            <p className="font-medium text-gray-900">
              {reservation.inventory.warehouse.name}
              <span className="text-sm text-gray-400 ml-1">
                ({reservation.inventory.warehouse.location})
              </span>
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-sm text-gray-500">Quantity</p>
              <p className="font-medium text-gray-900">{reservation.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-medium text-gray-900">
                {currencyFormatter.format(reservation.inventory.product.price * reservation.quantity)}
              </p>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        {isPending && timeLeft !== null && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Time remaining</p>
            {isExpired ? (
              <p className="text-2xl font-bold text-red-600">Expired</p>
            ) : (
              <p className={`text-3xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTime(timeLeft)}
              </p>
            )}
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
            {successMsg}
          </div>
        )}

        {/* Error message */}
        {actionError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {actionError}
          </div>
        )}

        {/* Action buttons */}
        {isPending && !isExpired && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={actionLoading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? 'Processing...' : 'Confirm Purchase'}
            </button>
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Reservation ID: {reservation.id}
          </p>
        </div>
      </div>
    </div>
  );
}
