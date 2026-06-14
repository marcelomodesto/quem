"use client";

import { useActionState } from "react";

type UserFormData = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
};

export function UserForm({
  user,
  action,
  submitLabel,
}: {
  user?: UserFormData;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await action(formData);
        return null;
      } catch (e: unknown) {
        return e instanceof Error ? e.message : "Erro ao salvar.";
      }
    },
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      {state && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
          {state}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={user?.name ?? ""}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Nome completo"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={user?.email ?? ""}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="usuario@exemplo.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Senha{user?.id ? " (deixe vazio para manter)" : ""}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required={!user?.id}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={user?.id ? "••••••••" : "Mínimo 6 caracteres"}
        />
      </div>

      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Perfil
        </label>
        <select
          id="role"
          name="role"
          defaultValue={user?.role ?? "GESTOR"}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="GESTOR">Gestor</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
        >
          {isPending ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
