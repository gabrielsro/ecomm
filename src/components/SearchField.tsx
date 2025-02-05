"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";

interface SearchFieldProps {
  className?: string;
}

export default function SearchField({ className }: SearchFieldProps) {
  //Search needs to redirect to another page:
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const barQuery = (form.barQuery as HTMLInputElement).value.trim();
    if (!barQuery) return;
    //If there's a query, put the query string as a searchParam in the URL:
    //encodeURIComponent() encodes special characters since not all are allowed in the URL:
    router.push(`/shop?q=${encodeURIComponent(barQuery)}`);
  }
  return (
    //Although form is an html element, 'onSubmit' requires javascript. By using the attributes 'method' and 'action', JS is not needed.
    <form
      onSubmit={handleSubmit}
      className={cn("grow", className)}
      method="GET"
      action="/shop"
    >
      <div className="relative">
        <Input name="barQuery" placeholder="Search" className="pe-10" />
        <SearchIcon className="absolute right-3 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground" />
      </div>
    </form>
  );
}
