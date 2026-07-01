/**
 * API e tipos do modulo {{ModuleName}}.
 *
 * Padrao do Portal: um arquivo por dominio em lib/. Os tipos ficam inline aqui
 * (interfaces XxxOut / XxxIn), nunca em uma pasta types/ separada por modulo.
 * A pasta types/ do projeto guarda apenas os tipos gerados do OpenAPI (api.ts).
 *
 * Toda chamada passa pela instancia unica `api` (Axios) de @/lib/api-client.
 * Paginas e componentes nunca chamam axios diretamente.
 *
 * {{moduleDescription}}
 */
import { api } from "@/lib/api-client";

// ----------- Codigos de permissao (RBAC) -----------
// Convencao do Portal: "<modulo>.<recurso>.<acao>" em minusculas.
// {{MODULE_KEY}} e o prefixo "<modulo>.<recurso>", ex: "contratos.contrato".
// Estes mesmos codigos precisam existir no backend (classe Perm) e nos grupos
// de acesso (ROLE_PERMISSIONS). Aqui sao usados so para o gate de UX.
export const PERMS = {
  read: "{{MODULE_KEY}}.read",
  create: "{{MODULE_KEY}}.create",
  update: "{{MODULE_KEY}}.update",
  delete: "{{MODULE_KEY}}.delete",
} as const;

// ----------- Interfaces -----------

export interface {{ModuleName}}Out {
  id: string;
  nome: string;
  status: string;
  created_at: string;
  updated_at: string | null;
}

export interface {{ModuleName}}ListParams {
  page?: number;
  page_size?: number;
  q?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface {{ModuleName}}CreateIn {
  nome: string;
  status?: string;
}

export interface {{ModuleName}}UpdateIn {
  nome?: string;
  status?: string;
}

// ----------- API functions -----------

const BASE = "/api/v1/{{moduleSlug}}";

export async function list{{ModuleName}}(
  params: {{ModuleName}}ListParams = {},
): Promise<PaginatedResponse<{{ModuleName}}Out>> {
  const { data } = await api.get<PaginatedResponse<{{ModuleName}}Out>>(BASE, { params });
  return data;
}

export async function get{{ModuleName}}(id: string): Promise<{{ModuleName}}Out> {
  const { data } = await api.get<{{ModuleName}}Out>(`${BASE}/${id}`);
  return data;
}

export async function create{{ModuleName}}(
  payload: {{ModuleName}}CreateIn,
): Promise<{{ModuleName}}Out> {
  const { data } = await api.post<{{ModuleName}}Out>(BASE, payload);
  return data;
}

export async function update{{ModuleName}}(
  id: string,
  payload: {{ModuleName}}UpdateIn,
): Promise<{{ModuleName}}Out> {
  const { data } = await api.patch<{{ModuleName}}Out>(`${BASE}/${id}`, payload);
  return data;
}

export async function delete{{ModuleName}}(id: string): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}
