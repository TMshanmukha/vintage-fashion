export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full">
        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-red-600 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
