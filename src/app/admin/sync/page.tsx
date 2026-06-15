"use client";

import { useActionState } from "react";
import { runSync, getSyncLogs, type SyncResult } from "./actions";
import { useEffect, useState } from "react";

type SyncLog = {
  id: number;
  status: string;
  message: string | null;
  imported: number;
  updated: number;
  removed: number;
  createdAt: Date;
};

export default function SyncPage() {
  const [logs, setLogs] = useState<SyncLog[]>([]);

  const loadLogs = () => {
    getSyncLogs().then((data) =>
      setLogs(data as SyncLog[])
    );
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const [state, formAction, isPending] = useActionState(
    async (
      _prev: { result?: SyncResult; error?: string } | null,
      _formData: FormData
    ) => {
      try {
        const result = await runSync();
        loadLogs();
        return { result };
      } catch (e: unknown) {
        loadLogs();
        return { error: e instanceof Error ? e.message : "Erro desconhecido" };
      }
    },
    null
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Sincronização de Dados
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-lg mb-8">
        <p className="text-sm text-gray-500 mb-6">
          Importe os dados de docentes e funcionários da API externa. Docentes
          serão agrupados por departamento, funcionários por setor.
        </p>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}
          {state?.result && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm space-y-1">
              <p className="font-semibold">Sincronização concluída!</p>
              <p>
                Docentes: {state.result.docentesImported} novos, {state.result.docentesUpdated} atualizados
              </p>
              <p>
                Funcionários: {state.result.funcionariosImported} novos, {state.result.funcionariosUpdated} atualizados
              </p>
              {state.result.groupsCreated > 0 && (
                <p>Grupos criados: {state.result.groupsCreated}</p>
              )}
              {state.result.errors.length > 0 && (
                <p className="text-yellow-700">
                  Avisos: {state.result.errors.join("; ")}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
          >
            {isPending ? "Sincronizando..." : "Sincronizar Agora"}
          </button>
        </form>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Histórico de Sincronizações
      </h2>

      {logs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          Nenhuma sincronização realizada ainda.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Data
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Importados
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Atualizados
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Removidos
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Mensagem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.status === "SUCCESS"
                          ? "bg-green-100 text-green-800"
                          : log.status === "PARTIAL"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.status === "SUCCESS"
                        ? "Sucesso"
                        : log.status === "PARTIAL"
                          ? "Parcial"
                          : "Erro"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.imported}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.updated}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.removed}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {log.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
