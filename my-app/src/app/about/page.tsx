'use client';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-6">About Benito Pepito</h1>
        <p className="text-lg text-black/80 leading-relaxed mb-8">
          Benito Pepito is an artist-first gallery and marketplace. We curate singular works
          across sculpture, painting, and home & garden installations. Our mission is to offer
          collectors a quiet, refined browsing experience where each work is presented with
          respect for the artist's intent.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white border border-[#cfc9c0] rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-3">Our Approach</h2>
            <p className="text-black/80">
              We favor natural textures, breathable layouts, and measured typography—allowing
              artworks to occupy center stage. Each piece is offered as a unique, single-quantity
              work. Sold works remain visible to preserve the exhibition record.
            </p>
          </section>
          <section className="bg-white border border-[#cfc9c0] rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-3">Curatorial Focus</h2>
            <p className="text-black/80">
              Our focus spans contemporary sculpture, original painting, and living installations
              for the home & garden. We care about material integrity, process, and provenance.
            </p>
          </section>
        </div>

        {/* Featured Artists */}
        <section className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Featured Artists</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#cfc9c0] rounded-xl p-6">
              <h3 className="text-xl font-semibold">A. Rivera</h3>
              <p className="text-black/70 mt-2">Works with stone and found earth materials to compose meditations on balance and place. Recent series explores Inukshuk-inspired stacks along riverbeds.</p>
            </div>
            <div className="bg-white border border-[#cfc9c0] rounded-xl p-6">
              <h3 className="text-xl font-semibold">S. Okoye</h3>
              <p className="text-black/70 mt-2">Bronze figures informed by dance and stillness, cast using traditional lost-wax techniques, emphasizing gesture and poise.</p>
            </div>
            <div className="bg-white border border-[#cfc9c0] rounded-xl p-6">
              <h3 className="text-xl font-semibold">T. Nguyen</h3>
              <p className="text-black/70 mt-2">Botanical installations for the home & garden that blur sculpture and living systems, attentive to seasonality and slow change.</p>
            </div>
          </div>
        </section>
        <div className="mt-10">
          <a href="/categories" className="inline-block bg-[var(--gold)] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[var(--gold-dark)] mr-4">Explore Categories</a>
          <a href="/contact" className="inline-block bg-[var(--gold)] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[var(--gold-dark)]">Contact Us</a>
        </div>
      </div>
    </div>
  );
}
