import Link from "next/link";

/** Estado "nao encontrado" da rota {{moduleSlug}} (App Router). */
export default function NotFound() {
  return (
    <div className="text-center py-16">
      <p className="text-sm font-semibold text-gray-600 mb-1">Registro nao encontrado</p>
      <p className="text-xs text-gray-400 mb-4">
        O item de {{moduleSlug}} que voce procura nao existe ou foi removido.
      </p>
      <Link
        href="/dashboard/{{moduleSlug}}"
        className="text-xs font-semibold text-[#E85928] hover:underline"
      >
        Voltar para a listagem
      </Link>
    </div>
  );
}
