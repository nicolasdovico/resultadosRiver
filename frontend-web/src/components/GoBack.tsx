"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function GoBack() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()}
      className="flex items-center text-zinc-500 hover:text-red-600 transition-colors font-bold text-sm uppercase tracking-widest"
    >
      <ChevronLeft size={20} className="mr-1" />
      Volver
    </button>
  );
}
