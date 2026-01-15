export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center stoneBg text-[var(--foreground)]">
      <div className="bg-white shadow rounded-sm p-8 text-center border border-[#cfc9c0]">
        <h1 className="text-3xl font-bold text-black mb-3">Payment Canceled</h1>
        <p className="text-black/70 mb-6">Your payment was canceled. You can continue shopping and try again.</p>
        <a href="/cart" className="inline-block bg-[var(--gold)] text-black px-6 py-3 rounded-sm font-semibold hover:bg-[var(--gold-dark)]">Back to Cart</a>
      </div>
    </div>
  );
}
