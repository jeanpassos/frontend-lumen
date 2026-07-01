"use client";

/** Barra de filtros do modulo {{ModuleName}}. Estado controlado pela pagina. */
interface {{ModuleName}}FiltersProps {
  q: string;
  status: string;
  onChangeQ: (value: string) => void;
  onChangeStatus: (value: string) => void;
}

const FIELD_CLASS =
  "text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#183c5a]";

export function {{ModuleName}}Filters({
  q,
  status,
  onChangeQ,
  onChangeStatus,
}: {{ModuleName}}FiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-2 flex flex-wrap gap-x-6 gap-y-2 items-center">
      <input
        type="search"
        value={q}
        onChange={(e) => onChangeQ(e.target.value)}
        placeholder="Buscar..."
        className={`${FIELD_CLASS} min-w-[200px]`}
      />
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Status</span>
        <select
          value={status}
          onChange={(e) => onChangeStatus(e.target.value)}
          className={FIELD_CLASS}
        >
          <option value="">Todos</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>
    </div>
  );
}
