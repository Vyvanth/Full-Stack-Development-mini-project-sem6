export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Keep',
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const confirmClass = tone === 'danger'
    ? 'bg-rose-600 text-white hover:bg-rose-700'
    : 'bg-primary-600 text-white hover:bg-primary-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
