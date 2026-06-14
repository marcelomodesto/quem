import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">GuiaQuem</h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Área Administrativa
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Diretório Institucional
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Consulte o catálogo de pessoas da organização. Busque por nome,
            departamento, setor ou categoria.
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
          <form className="flex gap-3">
            <input
              type="text"
              placeholder="Buscar pessoa..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Buscar
            </button>
          </form>
        </section>

        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-700 mb-2">--</div>
            <div className="text-gray-600">Departamentos</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-700 mb-2">--</div>
            <div className="text-gray-600">Setores</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-700 mb-2">--</div>
            <div className="text-gray-600">Pessoas</div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          GuiaQuem &copy; {new Date().getFullYear()} &mdash; Diretório
          Institucional
        </div>
      </footer>
    </div>
  );
}
