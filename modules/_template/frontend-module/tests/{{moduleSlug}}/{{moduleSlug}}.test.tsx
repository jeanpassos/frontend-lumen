/**
 * Testes do modulo {{ModuleName}} (vitest + @testing-library/react).
 *
 * Cobre o gate de permissao da pagina de listagem:
 *  - sem permissao de leitura, o conteudo nao e renderizado (estado "forbidden");
 *  - com permissao e sem itens, mostra o estado vazio.
 *
 * Os hooks de dados sao mockados para isolar a pagina da rede.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const mockHasPermission = vi.fn();
vi.mock("@/hooks/useHasPermission", () => ({
  useHasPermission: (code: string) => mockHasPermission(code),
}));

vi.mock("@/hooks/use{{ModuleName}}", () => ({
  use{{ModuleName}}List: () => ({
    data: { items: [], total: 0, page: 1, page_size: 20, pages: 0 },
    isLoading: false,
    error: null,
  }),
}));

import {{ModuleName}}Page from "@/app/(dashboard)/dashboard/{{moduleSlug}}/page";

describe("{{ModuleName}}Page", () => {
  it("bloqueia o acesso sem permissao de leitura", () => {
    mockHasPermission.mockReturnValue(false);
    render(<{{ModuleName}}Page />);
    expect(screen.getByText("Acesso nao autorizado")).toBeInTheDocument();
  });

  it("mostra o estado vazio com permissao e sem itens", () => {
    mockHasPermission.mockReturnValue(true);
    render(<{{ModuleName}}Page />);
    expect(screen.getByText("Nenhum registro encontrado")).toBeInTheDocument();
  });
});
