"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import type { {{ModuleName}}CreateIn } from "@/lib/{{moduleSlug}}";

/**
 * Formulario de criacao/edicao do modulo {{ModuleName}}.
 * Validacao via zod + react-hook-form (mesmo stack do Portal).
 * Ajuste o schema e os campos conforme as entidades reais do modulo.
 */
const schema = z.object({
  nome: z.string().min(1, "Informe o nome."),
  status: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface {{ModuleName}}FormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: {{ModuleName}}CreateIn) => void | Promise<void>;
  submitting?: boolean;
}

export function {{ModuleName}}Form({ defaultValues, onSubmit, submitting }: {{ModuleName}}FormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", status: "ativo", ...defaultValues },
  });

  return (
    <form
      onSubmit={handleSubmit((v) => onSubmit(v))}
      className="space-y-4 bg-white rounded-lg border border-gray-200 p-4"
    >
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
          Nome
        </label>
        <input
          {...register("nome")}
          className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#183c5a]"
        />
        {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
          Status
        </label>
        <select
          {...register("status")}
          className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#183c5a]"
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={submitting}>
          Salvar
        </Button>
      </div>
    </form>
  );
}
