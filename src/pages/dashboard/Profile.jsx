import { useState } from 'react';
import { toast } from 'react-toastify';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { currentUser } = useAuth();
  const [name, setName] = useState(currentUser?.displayName || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Display name cannot be empty.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await updateProfile(currentUser, { displayName: name });
      await setDoc(
        doc(db, 'users', currentUser.uid),
        { name, email: currentUser.email, uid: currentUser.uid },
        { merge: true }
      );
      toast.success('Profile updated.');
    } catch (err) {
      toast.error('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="dashboard-topbar">
        <h2 className="mb-0">Profile</h2>
      </div>

      <div className="dashboard-card" style={{ maxWidth: 500 }}>
        <div className="d-flex align-items-center gap-3 mb-4">
          <div
            className="rounded-circle bg-white bg-opacity-10 d-flex align-items-center justify-content-center"
            style={{ width: 64, height: 64, fontSize: '1.8rem' }}
          >
            <i className="bi bi-person-fill" />
          </div>
          <div>
            <div className="fw-bold">{currentUser?.displayName || 'Admin'}</div>
            <div className="text-50 small">{currentUser?.email}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              className={`form-control bg-transparent text-white border-secondary ${error ? 'is-invalid' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control bg-transparent text-50 border-secondary"
              value={currentUser?.email || ''}
              disabled
            />
          </div>

          <button type="submit" className="btn btn-custom" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
