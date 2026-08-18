import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import useContactMessages from '../../hooks/useContactMessages';
import {
  markContactMessageAsRead,
  markContactMessageAsUnread,
  deleteContactMessage,
} from '../../firebase/contactMessages';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';
import MessageDetailModal from '../../components/MessageDetailModal';
import LoadingSpinner from '../../components/LoadingSpinner';

function truncate(text, max = 60) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

export default function ContactMessages() {
  const { messages, loading, error, unreadCount } = useContactMessages();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); 
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const selectedMessage = messages.find((m) => m.id === selectedMessageId) || null;

  const visibleMessages = useMemo(() => {
    let list = messages;

    if (filter === 'unread') list = list.filter((m) => !m.read);
    else if (filter === 'read') list = list.filter((m) => m.read);

    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (m) =>
          m.name?.toLowerCase().includes(term) ||
          m.email?.toLowerCase().includes(term) ||
          m.subject?.toLowerCase().includes(term) ||
          m.message?.toLowerCase().includes(term)
      );
    }

    return list;
  }, [messages, search, filter]);

  const handleOpenMessage = (message) => {
    setSelectedMessageId(message.id);
    if (!message.read) {
      markContactMessageAsRead(message.id).catch((err) => {
        toast.error('Failed to mark message as read: ' + err.message);
      });
    }
  };

  const handleToggleRead = async (message) => {
    setToggling(true);
    try {
      if (message.read) {
        await markContactMessageAsUnread(message.id);
        toast.success('Marked as unread.');
      } else {
        await markContactMessageAsRead(message.id);
        toast.success('Marked as read.');
      }
    } catch (err) {
      toast.error('Failed to update message: ' + err.message);
    } finally {
      setToggling(false);
    }
  };

  const handleRequestDelete = (message) => {
    setSelectedMessageId(null);
    setDeleteTarget(message);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteContactMessage(deleteTarget.id);
      toast.success('Message deleted.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Failed to delete message: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="dashboard-topbar">
        <h2 className="mb-0">
          Contact Messages
          {unreadCount > 0 && (
            <span className="badge rounded-pill bg-light text-dark ms-2 align-middle">
              {unreadCount} unread
            </span>
          )}
        </h2>
      </div>

      <div className="dashboard-card mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-auto">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search name, email, subject, message..."
            />
          </div>
          <div className="col-12 col-md-auto">
            <select
              className="form-select bg-transparent text-white border-secondary"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all" className="text-dark">All</option>
              <option value="unread" className="text-dark">Unread</option>
              <option value="read" className="text-dark">Read</option>
            </select>
          </div>
          <div className="col-12 col-md-auto ms-md-auto text-white-50 small">
            {visibleMessages.length} of {messages.length} messages
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="empty-state">
            <i className="bi bi-exclamation-triangle fs-1 d-block mb-3" />
            Unable to load contact messages. Please try again.
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-envelope fs-1 d-block mb-3" />
            No contact messages yet.
          </div>
        ) : visibleMessages.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-search fs-1 d-block mb-3" />
            No messages match your search.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark-custom align-middle mb-0">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleMessages.map((m) => (
                  <tr
                    key={m.id}
                    role="button"
                    onClick={() => handleOpenMessage(m)}
                    className={m.read ? 'text-white-50' : 'fw-bold'}
                  >
                    <td>
                      <div>{m.name}</div>
                      <div className="text-50 small fw-normal">{m.email}</div>
                    </td>
                    <td>{m.subject}</td>
                    <td className="fw-normal">{truncate(m.message)}</td>
                    <td className="text-50 small fw-normal">
                      {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <span className={`status-badge ${m.read ? 'status-active' : 'status-inactive'}`}>
                        {m.read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-sm btn-outline-dark me-2"
                        onClick={() => handleOpenMessage(m)}
                      >
                        <i className="bi bi-eye" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRequestDelete(m)}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MessageDetailModal
        message={selectedMessage}
        onClose={() => setSelectedMessageId(null)}
        onToggleRead={handleToggleRead}
        onDelete={handleRequestDelete}
        toggling={toggling}
      />

      <Modal
        show={!!deleteTarget}
        title="Delete Message"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        confirmLabel="Delete"
        confirmVariant="danger"
        busy={deleting}
      >
        Are you sure you want to delete this message from{' '}
        <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
      </Modal>
    </div>
  );
}