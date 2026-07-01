"use client";

/**
 * Hooks de dados do modulo {{ModuleName}} (React Query).
 *
 * Encapsula as queryKeys e as chamadas a lib/{{moduleSlug}}.ts. As paginas
 * consomem estes hooks; nunca chamam fetch ou axios diretamente.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  list{{ModuleName}},
  get{{ModuleName}},
  create{{ModuleName}},
  update{{ModuleName}},
  delete{{ModuleName}},
  type {{ModuleName}}ListParams,
  type {{ModuleName}}CreateIn,
  type {{ModuleName}}UpdateIn,
} from "@/lib/{{moduleSlug}}";

const KEY = "{{moduleSlug}}";

export function use{{ModuleName}}List(params: {{ModuleName}}ListParams = {}) {
  return useQuery({
    queryKey: [KEY, "list", params],
    queryFn: () => list{{ModuleName}}(params),
  });
}

export function use{{ModuleName}}Detail(id: string | null) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => get{{ModuleName}}(id as string),
    enabled: !!id,
  });
}

export function useCreate{{ModuleName}}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {{ModuleName}}CreateIn) => create{{ModuleName}}(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "list"] }),
  });
}

export function useUpdate{{ModuleName}}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: {{ModuleName}}UpdateIn }) =>
      update{{ModuleName}}(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY, "list"] });
      qc.invalidateQueries({ queryKey: [KEY, "detail", id] });
    },
  });
}

export function useDelete{{ModuleName}}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => delete{{ModuleName}}(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "list"] }),
  });
}
