'use client';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-6">Contact</h1>
        <p className="text-lg text-black/80 leading-relaxed mb-8">
          We'd love to hear from you. For acquisition inquiries, consignments, or general
          questions, send us a message and our team will get back to you.
        </p>

        <form className="grid grid-cols-1 gap-6 bg-white border border-[#cfc9c0] rounded-xl p-6">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Name</label>
            <input
              type="text"
              className="w-full rounded-lg border border-[#cfc9c0] px-3 py-2 text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Your full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-[#cfc9c0] px-3 py-2 text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Message</label>
            <textarea
              rows={6}
              className="w-full rounded-lg border border-[#cfc9c0] px-3 py-2 text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Tell us about the artwork or project..."
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-black/70">Or write us directly: <a href="mailto:info@benitopepito.art" className="underline">info@benitopepito.art</a></p>
            <button
              type="submit"
              className="inline-flex items-center bg-amber-500 hover:bg-amber-400 text-black font-semibold px-6 py-3 rounded-lg"
            >
              Send Message
            </button>
          </div>
        </form>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#cfc9c0] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Gallery</h2>
            <p className="text-black/80">Mon–Sat, 10:00–18:00</p>
            <p className="text-black/80">123 Stone Avenue, Montreal, QC</p>
          </div>
          <div className="bg-white border border-[#cfc9c0] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Press</h2>
            <p className="text-black/80">press@benitopepito.art</p>
          </div>
          <div className="bg-white border border-[#cfc9c0] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Sales</h2>
            <p className="text-black/80">sales@benitopepito.art</p>
          </div>
        </div>
      </div>
    </div>
  );
}
