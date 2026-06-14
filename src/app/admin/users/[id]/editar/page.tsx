import Link from "next/link";
import { notFound } from "next/navigation";
import { UserForm } from "@/components/user-form";
import { getUserById, updateUser } from "../../actions";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) notFound();

  const user = await getUserById(userId);
  if (!user) notFound();

  const action = async (formData: FormData) => {
    "use server";
    await updateUser(userId, formData);
  };

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
        Editar Usuário
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-lg">
        <UserForm user={user} action={action} submitLabel="Salvar Alterações" />
      </div>
    </div>
  );
}
