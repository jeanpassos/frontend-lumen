"use client";

import Link from "next/link";
import { {{ModuleName}}StatusBadge } from "@/components/{{moduleSlug}}/{{ModuleName}}StatusBadge";
import type { {{ModuleName}}Out } from "@/lib/{{moduleSlug}}";

/** Tabela de listagem do modulo {{ModuleName}}. */
export function {{ModuleName}}Table({ items }: { items: {{ModuleName}}Out[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">
            <th className="px-4 py-2">Nome</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2 w-24" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-900">{item.nome}</td>
              <td className="px-4 py-2">
                <{{ModuleName}}StatusBadge status={item.status} />
              </td>
              <td className="px-4 py-2 text-right">
                <Link
                  href={`/dashboard/{{moduleSlug}}/${item.id}`}
                  className="text-xs font-semibold text-[#E85928] hover:underline"
                >
                  Detalhe
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
