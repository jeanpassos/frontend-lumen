"use client";

import { type ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";

/** Cabecalho padrao do modulo {{ModuleName}}. Reusa o PageHeader compartilhado. */
export function {{ModuleName}}Header({ actions }: { actions?: ReactNode }) {
  return (
    <PageHeader
      title="{{ModuleName}}"
      description="{{moduleDescription}}"
      actions={actions}
    />
  );
}
