import { Skeleton } from "@heroui/react";

export default function NavbarSkeleton() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5">
      <Skeleton className="h-8 w-8 rounded-full" />

      <Skeleton className="hidden h-4 w-20 rounded-md md:block" />

      <Skeleton className="h-4 w-4 rounded-full" />
    </div>
  );
}
