import { useState } from 'react';
import { toast } from 'react-toastify';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { uploadProfilePhoto, validateProfilePhoto } from '../firebase/storage';

export default function EditProfileModal({ show, profile, onClose }) {
  const { currentUser } = useAuth();
  const [name, setName] = useState(profile?.name || currentUser?.displayName || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(profile?.photoURL || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!show) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateProfilePhoto(file);
    if (validationError) {
      toast.error(validationError);
      e.target.value = '';
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Full name cannot be empty.');
      return;
    }
    setError('');
    setSaving(true);

    try {
      let photoURL = profile?.photoURL || '';
      if (photoFile) {
        photoURL = await uploadProfilePhoto(currentUser.uid, photoFile);
      }

      // Keep Firebase Auth's own profile fields in sync (used as a
      // fallback anywhere the app might read currentUser directly).
      await updateProfile(currentUser, { displayName: name, photoURL });

      // Firestore is the actual source of truth the UI renders from.
      await setDoc(
        doc(db, 'users', currentUser.uid),
        { name, photoURL, email: currentUser.email, uid: currentUser.uid },
        { merge: true }
      );

      toast.success('Profile updated.');
      onClose();
    } catch (err) {
      toast.error('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content bg-dark text-white border-secondary">
            <div className="modal-header border-secondary">
              <h5 className="modal-title">Edit Profile</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Close"
                disabled={saving}
              />
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body">
                <div className="text-center mb-4">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="rounded-circle mb-2"
                      style={{ width: 96, height: 96, objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-white bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-2"
                      style={{ width: 96, height: 96, fontSize: '2.5rem' }}
                    >
                      <i className="bi bi-person-fill" />
                    </div>
                  )}
                  <div>
                    <label className="btn btn-sm btn-outline-light mb-0">
                      Change Photo
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileChange}
                        hidden
                        disabled={saving}
                      />
                    </label>
                    <div className="text-white-50 small mt-1">JPG, PNG, WEBP, or GIF. Max 5MB.</div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className={`form-control bg-transparent text-white border-secondary ${error ? 'is-invalid' : ''}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                  />
                  {error && <div className="invalid-feedback">{error}</div>}
                </div>

                <div className="mb-1">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control bg-transparent text-white-50 border-secondary"
                    value={currentUser?.email || ''}
                    disabled
                  />
                  <div className="text-white-50 small mt-1">
                    Email is managed by your account login and can't be changed here.
                  </div>
                </div>
              </div>

              <div className="modal-footer border-secondary">
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-custom" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}