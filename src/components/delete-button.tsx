"use client";

import { useRef } from "react";

export function DeleteButton({
  onDelete,
  id,
}: {
  onDelete: (id: number) => Promise<void>;
  id: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async () => {
        if (confirm("Tem certeza que deseja excluir este usuário?")) {
          await onDelete(id);
        }
      }}
    >
      <button
        type="submit"
        className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
      >
        Excluir
      </button>
    </form>
  );
}
