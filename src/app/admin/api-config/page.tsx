"use client";

import { useActionState } from "react";
import { getApiConfig, saveApiConfig } from "./actions";
import { useEffect, useState } from "react";

export default function ApiConfigPage() {
  const [config, setConfig] = useState<{
    url: string;
    user: string;
    hasPassword: boolean;
  } | null>(null);

  useEffect(() => {
    getApiConfig().then(setConfig);
  }, []);

  const [state, formAction, isPending] = useActionState(
    async (
      _prev: { error?: string; success?: boolean } | null,
      formData: FormData
    ) => {
      const result = await saveApiConfig(formData);
      if (result.success) {
        const updated = await getApiConfig();
        setConfig(updated);
      }
      return result;
    },
    null
  );

  if (!config) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Configuração da API
        </h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Configuração da API
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-lg">
        <p className="text-sm text-gray-500 mb-6">
          Configure os dados de acesso à API externa de onde os dados são
          importados.
        </p>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm">
              Configuração salva com sucesso.
            </div>
          )}

          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              URL da API
            </label>
            <input
              id="url"
              name="url"
              type="url"
              required
              defaultValue={config.url}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://api.exemplo.com/v1"
            />
          </div>

          <div>
            <label
              htmlFor="user"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Usuário
            </label>
            <input
              id="user"
              name="user"
              type="text"
              defaultValue={config.user}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="usuario_api"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Senha{config.hasPassword ? " (deixe vazio para manter)" : ""}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                config.hasPassword ? "•••••••• (já configurada)" : "Senha da API"
              }
            />
            {config.hasPassword && (
              <p className="text-xs text-gray-400 mt-1">
                Uma senha já está configurada. Preencha apenas para alterar.
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Salvar Configuração"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
