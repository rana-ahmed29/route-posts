export default function Notifications() {
  return (
    // no outer container here either — same reasoning as Newsfeed.
    // just the page content, width comes from MainLayout
    <div>
      <h1 className="mb-4 text-xl font-extrabold text-slate-900">
        Notifications
      </h1>

      {/* placeholder for now — replace with real notifications list */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          You don't have any notifications yet.
        </p>
      </div>
    </div>
  );
}
