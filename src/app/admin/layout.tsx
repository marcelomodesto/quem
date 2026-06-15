import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gray-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-xl font-bold">
            GuiaQuem Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/admin/api-config"
              className="hover:text-gray-300 transition-colors"
            >
              Config API
            </Link>
            <Link
              href="/admin/sync"
              className="hover:text-gray-300 transition-colors"
            >
              Sincronizar
            </Link>
            <Link
              href="/admin/catalogo"
              className="hover:text-gray-300 transition-colors"
            >
              Catalogo
            </Link>
            <Link
              href="/admin/users"
              className="hover:text-gray-300 transition-colors"
            >
              Usuarios
            </Link>
            <Link href="/" className="hover:text-gray-300 transition-colors">
              Catálogo Público
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
