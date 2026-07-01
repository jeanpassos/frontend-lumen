"use client";

import { {{ModuleName}}StatusBadge } from "@/components/{{moduleSlug}}/{{ModuleName}}StatusBadge";
import type { {{ModuleName}}Out } from "@/lib/{{moduleSlug}}";

/** Visao de detalhe de um registro do modulo {{ModuleName}}. */
export function {{ModuleName}}Detail({ item }: { item: {{ModuleName}}Out }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{item.nome}</h1>
        <{{ModuleName}}StatusBadge status={item.status} />
      </div>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-xs font-bold text-gray-400 uppercase tracking-wide">Criado em</dt>
          <dd className="text-gray-900">{item.created_at}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold text-gray-400 uppercase tracking-wide">Atualizado em</dt>
          <dd className="text-gray-900">{item.updated_at ?? "-"}</dd>
        </div>
      </dl>
    </div>
  );
}
