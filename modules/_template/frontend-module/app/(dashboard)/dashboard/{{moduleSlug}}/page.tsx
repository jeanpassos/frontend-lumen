"use client";

/**
 * Pagina de listagem do modulo {{ModuleName}}.
 *
 * URL: /dashboard/{{moduleSlug}}
 * Permissao de leitura: {{MODULE_KEY}}.read
 *
 * Estrutura obrigatoria do template:
 *  - gate de permissao ANTES de qualquer hook de dados (estado "forbidden");
 *  - estados de carregamento, vazio e erro tratados de forma explicita;
 *  - dados via hook use{{ModuleName}}List (React Query), nunca fetch direto.
 *
 * O gate fica no componente externo e o conteudo num componente interno para
 * que os hooks nunca sejam chamados de forma condicional.
 */
import { useState } from "react";
import { useHasPermission } from "@/hooks/useHasPermission";
import { use{{ModuleName}}List } from "@/hooks/use{{ModuleName}}";
import { PERMS } from "@/lib/{{moduleSlug}}";
import { {{ModuleName}}Header } from "@/components/{{moduleSlug}}/{{ModuleName}}Header";
import { {{ModuleName}}Filters } from "@/components/{{moduleSlug}}/{{ModuleName}}Filters";
import { {{ModuleName}}Table } from "@/components/{{moduleSlug}}/{{ModuleName}}Table";
import { {{ModuleName}}EmptyState } from "@/components/{{moduleSlug}}/{{ModuleName}}EmptyState";

export default function {{ModuleName}}Page() {
  const canRead = useHasPermission(PERMS.read);

  if (!canRead) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-sm text-amber-800">
        <p className="font-bold mb-1">Acesso nao autorizado</p>
        <p>Voce nao tem permissao para visualizar este modulo.</p>
      </div>
    );
  }

  return <{{ModuleName}}Content />;
}

function {{ModuleName}}Content() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");

  const { data, isLoading, error } = use{{ModuleName}}List({
    q: q || undefined,
    status: status || undefined,
  });

  return (
    <div className="space-y-4">
      <{{ModuleName}}Header />

      <{{ModuleName}}Filters
        q={q}
        status={status}
        onChangeQ={setQ}
        onChangeStatus={setStatus}
      />

      {isLoading && (
        <div className="text-center py-16 text-gray-400 text-sm">Carregando...</div>
      )}

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-sm text-amber-800">
          <p className="font-bold mb-1">Erro ao carregar</p>
          <p>Nao foi possivel carregar os dados. Tente novamente.</p>
        </div>
      )}

      {!isLoading && !error && data && data.items.length === 0 && (
        <{{ModuleName}}EmptyState />
      )}

      {!isLoading && !error && data && data.items.length > 0 && (
        <{{ModuleName}}Table items={data.items} />
      )}
    </div>
  );
}
