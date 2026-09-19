export default function PublishingPostCard({
  body,
  imageUrl,
  progress,
}: {
  body: string;
  imageUrl?: string;
  progress: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <img
          src="https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png"
          alt="Rana Ahmed"
          className="h-11 w-11 rounded-full object-cover"
        />
        <div>
          <p className="text-base font-extrabold text-slate-900">Rana Ahmed</p>
          <p className="text-xs font-semibold text-[#1877f2]">
            Publishing... {progress}%
          </p>
        </div>
      </div>

      <p className="mb-3 whitespace-pre-wrap text-[17px] leading-relaxed text-slate-800">
        {body}
      </p>

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Uploading preview"
          className="mb-3 max-h-72 w-full rounded-lg object-cover"
        />
      )}

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-[#1877f2] transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
