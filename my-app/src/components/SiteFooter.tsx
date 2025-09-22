export default function SiteFooter() {
  return (
    <footer className="mt-16 bg-white/80 border-t border-[#cfc9c0] text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-3">Benito Pepito</h3>
            <p className="text-black/70">Artist-first gallery and marketplace for sculpture, painting, and home & garden installations.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-black/70">
              <li><a href="/categories" className="hover:text-[var(--gold)]">Categories</a></li>
              <li><a href="/about" className="hover:text-[var(--gold)]">About</a></li>
              <li><a href="/contact" className="hover:text-[var(--gold)]">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-black/70">
              <li>info@benitopepito.art</li>
              <li>123 Stone Avenue, Montreal, QC</li>
              <li>Mon–Sat, 10:00–18:00</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Follow</h4>
            <ul className="space-y-2 text-black/70">
              <li><a href="#" className="hover:text-[var(--gold)]">Instagram</a></li>
              <li><a href="#" className="hover:text-[var(--gold)]">TikTok</a></li>
              <li><a href="#" className="hover:text-[var(--gold)]">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#cfc9c0] mt-8 pt-6 text-center text-black/60">
          <p>© {new Date().getFullYear()} Benito Pepito. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
