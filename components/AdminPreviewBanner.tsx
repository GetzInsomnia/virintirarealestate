import { useMemo } from 'react';
import { useAdminPreview } from '@/context/AdminPreviewContext';

export default function AdminPreviewBanner(): JSX.Element | null {
  const { isPreview, exitPreview, activatePreview, lastInlineEditTarget } =
    useAdminPreview();

  const highlight = useMemo(() => {
    if (!lastInlineEditTarget) return null;
    const label = lastInlineEditTarget.label || lastInlineEditTarget.slug || lastInlineEditTarget.id;
    if (!label) return null;
    return String(label);
  }, [lastInlineEditTarget]);

  if (!isPreview) {
    return null;
  }

  return (
    <div className="z-50 flex items-center justify-between gap-4 bg-amber-400 px-4 py-2 text-sm text-black shadow-md">
      <div className="flex flex-col gap-1">
        <span className="font-semibold uppercase tracking-wide">Admin Preview Mode</span>
        <span>
          Changes are visible only to you until they are published.
          {highlight && ` Editing: ${highlight}`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded border border-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide transition hover:bg-black hover:text-white"
          onClick={exitPreview}
        >
          Exit preview
        </button>
        <button
          type="button"
          className="rounded bg-black px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-black/80"
          onClick={activatePreview}
        >
          Refresh tools
        </button>
      </div>
    </div>
  );
}
