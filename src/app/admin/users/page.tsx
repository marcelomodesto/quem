import Link from "next/link";
import { getUsers } from "./actions";
import { DeleteButton } from "@/components/delete-button";
import { deleteUser } from "./actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
        <Link
          href="/admin/users/novo"
          className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors text-sm"
        >
          Novo Usuário
        </Link>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          Nenhum usuário cadastrado.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Nome
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  E-mail
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                  Perfil
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role === "ADMIN" ? "Administrador" : "Gestor"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                    <Link
                      href={`/admin/users/${user.id}/editar`}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium mr-4"
                    >
                      Editar
                    </Link>
                    <DeleteButton onDelete={deleteUser} id={user.id} />
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
