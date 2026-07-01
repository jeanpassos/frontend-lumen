"use client";

/**
 * Pagina de detalhe do modulo {{ModuleName}}.
 *
 * URL: /dashboard/{{moduleSlug}}/[id]
 * Permissao de leitura: {{MODULE_KEY}}.read
 */
import { useParams, notFound } from "next/navigation";
import { useHasPermission } from "@/hooks/useHasPermission";
import { use{{ModuleName}}Detail } from "@/hooks/use{{ModuleName}}";
import { PERMS } from "@/lib/{{moduleSlug}}";
import { {{ModuleName}}Detail } from "@/components/{{moduleSlug}}/{{ModuleName}}Detail";

export default function {{ModuleName}}DetailPage() {
  const canRead = useHasPermission(PERMS.read);
  const params = useParams<{ id: string }>();
  const id = params?.id ?? null;

  if (!canRead) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-sm text-amber-800">
        <p className="font-bold mb-1">Acesso nao autorizado</p>
        <p>Voce nao tem permissao para visualizar este registro.</p>
      </div>
    );
  }

  return <{{ModuleName}}DetailContent id={id} />;
}

function {{ModuleName}}DetailContent({ id }: { id: string | null }) {
  const { data, isLoading, error } = use{{ModuleName}}Detail(id);

  if (isLoading) {
    return <div className="text-center py-16 text-gray-400 text-sm">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-sm text-amber-800">
        <p className="font-bold mb-1">Erro ao carregar</p>
        <p>Nao foi possivel carregar o registro.</p>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  return <{{ModuleName}}Detail item={data} />;
}
