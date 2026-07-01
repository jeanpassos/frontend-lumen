"use client";

/** Boundary de erro da rota {{moduleSlug}} (App Router). */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-sm text-amber-800">
      <p className="font-bold mb-1">Algo deu errado</p>
      <p className="mb-4">Nao foi possivel carregar este modulo.</p>
      <button
        onClick={reset}
        className="inline-flex items-center px-3 py-1.5 rounded-md bg-[#183c5a] text-white text-xs font-semibold hover:bg-[#122f4a]"
      >
        Tentar novamente
      </button>
    </div>
  );
}
