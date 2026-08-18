export default function Modal({ show, title, children, onClose, onConfirm, confirmLabel = 'Confirm', confirmVariant = 'light', busy = false }) {
  if (!show) return null;

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content bg-dark text-white border-secondary">
            <div className="modal-header border-secondary">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-outline-light" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              {onConfirm && (
                <button
                  type="button"
                  className={`btn btn-${confirmVariant}`}
                  onClick={onConfirm}
                  disabled={busy}
                >
                  {busy ? 'Please wait...' : confirmLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
