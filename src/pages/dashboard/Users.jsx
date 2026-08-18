import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import SearchBar from '../../components/SearchBar';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setLoading(false);
        setError(
          err.code === 'permission-denied'
            ? "Firestore denied this read. Your security rules likely haven't been published yet, or this account isn't recognized as admin — see README's Firestore rules section."
            : `Failed to load users: ${err.message}`
        );
      }
    );
    return unsubscribe;
  }, []);

  const visibleUsers = useMemo(() => {
    if (!search.trim()) return users;
    const term = search.toLowerCase();
    return users.filter(
      (u) => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
    );
  }, [users, search]);

  return (
    <div>
      <div className="dashboard-topbar">
        <h2 className="mb-0">Manage Users</h2>
      </div>

      <div className="dashboard-card mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
      </div>

      <div className="dashboard-card">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="empty-state">
            <i className="bi bi-exclamation-triangle fs-1 d-block mb-3" />
            {error}
          </div>
        ) : visibleUsers.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-people fs-1 d-block mb-3" />
            {users.length === 0
              ? 'No users found. Accounts created directly in Firebase Authentication (not through /register) won\'t appear here — see the note below.'
              : 'No users match your search.'}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark-custom align-middle mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name || '—'}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="status-badge status-active">{u.role || 'admin'}</span>
                    </td>
                    <td className="text-50 small">
                      {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-white-50 small mt-3">
        This list reads from the Firestore <code>users</code> collection, which is written to
        automatically only when someone registers through <code>/register</code>. Accounts
        added directly via Firebase Authentication (or Auth-only imports) won't have a matching
        document here. Removing an account requires the Firebase Admin SDK and is best done
        from a secured backend/Cloud Function.
      </p>
    </div>
  );
}