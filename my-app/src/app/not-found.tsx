export default function NotFound() {
  return (
    <html>
      <body>
        <main className="min-h-screen flex items-center justify-center text-center p-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">404 – Not Found</h1>
            <p className="text-gray-600 mb-6">The page you are looking for doesn’t exist.</p>
            <a href="/" className="inline-block bg-[var(--gold)] text-black px-6 py-3 font-semibold hover:bg-[var(--gold-dark)] transition-colors">Go back home</a>
          </div>
        </main>
      </body>
    </html>
  );
}
