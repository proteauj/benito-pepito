// app/products/loading.tsx
export default function ProductsLoading() {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-[var(--gold)] rounded-full mb-4"></div>
          <p className="text-lg font-medium">Chargement des œuvres...</p>
        </div>
      </div>
    );
  }