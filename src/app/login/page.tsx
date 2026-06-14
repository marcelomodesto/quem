"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "./actions";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await login(formData);
      if (result.success) {
        router.push("/admin");
        router.refresh();
      }
      return result;
    },
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold text-blue-700">
            GuiaQuem
          </Link>
          <p className="text-gray-500 mt-2">Acesso ao painel administrativo</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                {state.error}
              </div>
            )}

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
                autoComplete="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="voce@exemplo.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {isPending ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-blue-700 hover:underline">
            &larr; Voltar ao catálogo público
          </Link>
        </div>
      </div>
    </div>
  );
}
