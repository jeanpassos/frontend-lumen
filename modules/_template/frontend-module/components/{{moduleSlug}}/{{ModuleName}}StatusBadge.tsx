"use client";

import { Badge } from "@/components/ui/Badge";

/**
 * Badge de status do modulo {{ModuleName}}.
 *
 * Mapeia o status de dominio para a variante visual do Badge compartilhado.
 * Ajuste o mapa STATUS_VARIANT conforme os status reais do modulo.
 */
type Variant = "default" | "navy" | "success" | "warning" | "danger" | "gold" | "muted";

const STATUS_VARIANT: Record<string, Variant> = {
  ativo: "success",
  inativo: "muted",
  pendente: "warning",
  cancelado: "danger",
};

export function {{ModuleName}}StatusBadge({ status }: { status: string }) {
  const variant = STATUS_VARIANT[status.toLowerCase()] ?? "default";
  return (
    <Badge variant={variant} dot>
      {status}
    </Badge>
  );
}
