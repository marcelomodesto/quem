import Link from "next/link";
import { UserForm } from "@/components/user-form";
import { createUser } from "../actions";

export default function NewUserPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-sm text-blue-700 hover:underline"
        >
          &larr; Voltar para lista
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Novo Usuário
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-lg">
        <UserForm action={createUser} submitLabel="Criar Usuário" />
      </div>
    </div>
  );
}
