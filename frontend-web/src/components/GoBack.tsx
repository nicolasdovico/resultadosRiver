"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface GoBackProps {
  href?: string;
  label?: string;
}

export default function GoBack({ href, label = "Volver" }: GoBackProps) {
  const router = useRouter();

  if (href) {
    return (
      <Link 
        href={href}
        className="inline-flex items-center text-zinc-500 hover:text-red-600 transition-colors font-bold text-sm uppercase tracking-widest mb-8 group"
      >
        <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        {label}
      </Link>
    );
  }

  return (
    <button 
      onClick={() => router.back()}
      className="inline-flex items-center text-zinc-500 hover:text-red-600 transition-colors font-bold text-sm uppercase tracking-widest mb-8 group"
    >
      <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
      {label}
    </button>
  );
}
