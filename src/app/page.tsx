import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { unstable_noStore } from "next/cache";

export default async function HomePage() {
  unstable_noStore();
  const [groupCount, personCount] = await Promise.all([
    prisma.group.count({ where: { deletedAt: null, parentId: null } }),
    prisma.person.count({ where: { deletedAt: null } }),
  ]);

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
              Area Administrativa
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Diretorio Institucional
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Consulte o catalogo de pessoas da organizacao. Busque por nome,
            grupo ou funcao.
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

        <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-700 mb-2">{groupCount}</div>
            <div className="text-gray-600">Grupos</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-700 mb-2">{personCount}</div>
            <div className="text-gray-600">Pessoas</div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          GuiaQuem &copy; {new Date().getFullYear()} &mdash; Diretorio
          Institucional
        </div>
      </footer>
    </div>
  );
}
