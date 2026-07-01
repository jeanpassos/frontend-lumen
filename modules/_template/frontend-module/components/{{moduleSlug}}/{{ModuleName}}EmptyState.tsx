"use client";

import { type ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";

/** Estado vazio do modulo {{ModuleName}}. Reusa o EmptyState compartilhado. */
export function {{ModuleName}}EmptyState({ action }: { action?: ReactNode }) {
  return (
    <EmptyState
      title="Nenhum registro encontrado"
      description="Ainda nao ha itens de {{moduleSlug}} para exibir."
      action={action}
    />
  );
}
