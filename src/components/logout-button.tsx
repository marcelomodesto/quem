"use client";

import { logout } from "@/app/logout/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors"
      >
        Sair
      </button>
    </form>
  );
}
