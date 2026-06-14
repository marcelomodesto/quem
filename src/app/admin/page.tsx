import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Painel Administrativo
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/admin/api-config"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-2">⚙️</div>
          <h2 className="font-semibold text-gray-900">Configuração da API</h2>
          <p className="text-sm text-gray-500 mt-1">
            Configurar URL, usuário e senha da API externa
          </p>
        </Link>

        <Link
          href="/admin/sync"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-2">🔄</div>
          <h2 className="font-semibold text-gray-900">Sincronizar Dados</h2>
          <p className="text-sm text-gray-500 mt-1">
            Importar e atualizar dados da API
          </p>
        </Link>

        <Link
          href="/admin"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-2">👥</div>
          <h2 className="font-semibold text-gray-900">Pessoas</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerenciar pessoas do diretório
          </p>
        </Link>

        <Link
          href="/admin"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-2">📄</div>
          <h2 className="font-semibold text-gray-900">Gerar PDF</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerar catálogo em formato PDF
          </p>
        </Link>
      </div>
    </div>
  );
}
