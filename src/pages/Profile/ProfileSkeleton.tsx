export default function ProfileSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6 animate-pulse">
      {/* header card skeleton */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,.06)] sm:rounded-[28px]">
        {/* cover */}
        <div className="h-44 w-full bg-slate-200 sm:h-52 lg:h-60" />

        <div className="relative -mt-12 px-3 pb-5 sm:-mt-16 sm:px-8 sm:pb-6">
          <div className="rounded-3xl border border-white/60 bg-white/92 p-5 backdrop-blur-xl sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-end gap-4">
                  {/* avatar */}
                  <div className="h-28 w-28 shrink-0 rounded-full border-4 border-white bg-slate-200" />

                  <div className="min-w-0 space-y-2 pb-1">
                    <div className="h-8 w-48 rounded-lg bg-slate-200 sm:h-10 sm:w-64" />
                    <div className="h-5 w-32 rounded-lg bg-slate-200 sm:w-40" />
                    <div className="h-6 w-40 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>

              {/* stat row */}
              <div className="grid w-full grid-cols-3 gap-2 lg:w-130">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center sm:px-4 sm:py-4"
                  >
                    <div className="mx-auto h-3 w-14 rounded bg-slate-200" />
                    <div className="mx-auto mt-2 h-7 w-8 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>

            {/* about + posts summary */}
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="h-4 w-16 rounded bg-slate-200" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-48 rounded bg-slate-200" />
                  <div className="h-4 w-40 rounded bg-slate-200" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-[#dbeafe] bg-[#f6faff] px-4 py-3"
                  >
                    <div className="h-3 w-20 rounded bg-slate-200" />
                    <div className="mt-2 h-7 w-10 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* tabs skeleton */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="h-9 w-48 rounded-xl bg-slate-100" />
          <div className="h-6 w-8 rounded-full bg-slate-100" />
        </div>

        {/* post card skeletons */}
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_6px_rgba(15,23,42,.05)]"
            >
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 rounded bg-slate-200" />
                  <div className="h-3 w-16 rounded bg-slate-200" />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-2/3 rounded bg-slate-200" />
              </div>
              <div className="mt-4 flex items-center gap-5 border-t border-slate-100 pt-3">
                <div className="h-3.5 w-14 rounded bg-slate-200" />
                <div className="h-3.5 w-14 rounded bg-slate-200" />
                <div className="h-3.5 w-16 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
