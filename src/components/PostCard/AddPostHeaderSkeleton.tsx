import { Skeleton } from "@heroui/react";

export default function AddPostHeaderSkeleton() {
  return (
    <div className="mb-3 flex items-start gap-3">
      {/* Avatar */}
      <Skeleton className="h-11 w-11 shrink-0 rounded-full" />

      <div className="flex-1">
        {/* User name */}
        <Skeleton className="h-5 w-28 rounded-md" />

        {/* Privacy selector */}
        <Skeleton className="mt-1 h-6 w-24 rounded-full" />
      </div>
    </div>
  );
}
