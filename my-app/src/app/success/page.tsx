export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center stoneBg text-[var(--foreground)]">
      <div className="bg-white shadow rounded-lg p-8 text-center border border-[#cfc9c0]">
        <h1 className="text-3xl font-bold text-black mb-3">Payment Successful</h1>
        <p className="text-black/70 mb-6">Thank you! Your order has been placed successfully.</p>
        <a href="/" className="inline-block bg-[var(--gold)] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[var(--gold-dark)]">Back to Home</a>
      </div>
    </div>
  );
}
