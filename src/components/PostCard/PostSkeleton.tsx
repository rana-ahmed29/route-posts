import { Skeleton } from "@heroui/react";

export default function PostCardSkeleton() {
  return (
    <>
   
    { [0,1,2].map(()=>{
        return(
            <>
             <article className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* header: avatar, name, meta row */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-28 rounded-lg" />
            <Skeleton className="h-2.5 w-40 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>

      {/* body text */}
      <div className="space-y-2 px-4 pb-3">
        <Skeleton className="h-3 w-full rounded-lg" />
        <Skeleton className="h-3 w-4/5 rounded-lg" />
      </div>

      {/* image */}
      <Skeleton className="h-56 w-full rounded-none" />

      <div className="p-3 pt-3">
        {/* likes/shares/comments row */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-3 w-16 rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-14 rounded-lg" />
            <Skeleton className="h-3 w-16 rounded-lg" />
          </div>
        </div>

        <div className="mx-4 border-t border-slate-200" />

        {/* like/comment/share buttons */}
        <div className="grid grid-cols-3 gap-1 p-1">
          <Skeleton className="h-9 rounded-md" />
          <Skeleton className="h-9 rounded-md" />
          <Skeleton className="h-9 rounded-md" />
        </div>

        {/* top comment */}
        <div className="mx-2 mb-1 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <Skeleton className="mb-2 h-2.5 w-20 rounded-lg" />
          <div className="flex items-start gap-2">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2 rounded-2xl bg-white px-3 py-2">
              <Skeleton className="h-2.5 w-24 rounded-lg" />
              <Skeleton className="h-3 w-full rounded-lg" />
            </div>
          </div>
          <Skeleton className="mt-2 h-2.5 w-24 rounded-lg" />
        </div>
      </div>
    </article>
            </>
        )
    })

    }
   </>
 )
}

