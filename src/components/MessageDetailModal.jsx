export default function MessageDetailModal({
  message,
  onClose,
  onToggleRead,
  onDelete,
  toggling = false,
}) {
  if (!message) return null;

  const formattedDate = message.createdAt?.toDate
    ? message.createdAt.toDate().toLocaleString()
    : '—';

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div className="modal-content bg-dark text-white border-secondary">
            <div className="modal-header border-secondary">
              <h5 className="modal-title">{message.subject || '(No subject)'}</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Close"
              />
            </div>

            <div className="modal-body">
              <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">
                <div>
                  <div className="fw-bold">{message.name}</div>
                  <div className="text-white-50 small">{message.email}</div>
                </div>
                <span
                  className={`status-badge ${message.read ? 'status-active' : 'status-inactive'}`}
                >
                  {message.read ? 'Read' : 'Unread'}
                </span>
              </div>

              <p className="text-white-50 small mb-3">{formattedDate}</p>

              <p style={{ whiteSpace: 'pre-wrap' }}>{message.message}</p>
            </div>

            <div className="modal-footer border-secondary flex-wrap">
              <button
                type="button"
                className="btn btn-outline-danger me-auto"
                onClick={() => onDelete(message)}
              >
                <i className="bi bi-trash me-1" />
                Delete
              </button>
              <button
                type="button"
                className="btn btn-outline-light"
                onClick={() => onToggleRead(message)}
                disabled={toggling}
              >
                {toggling
                  ? 'Please wait...'
                  : message.read
                    ? 'Mark as Unread'
                    : 'Mark as Read'}
              </button>
              <button type="button" className="btn btn-light" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}