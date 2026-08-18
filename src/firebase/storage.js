import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function validateProfilePhoto(file) {
  if (!file) return 'No file selected.';
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG, WEBP, or GIF image.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Image must be smaller than 5MB.';
  }
  return null;
}

export async function uploadProfilePhoto(uid, file) {
  const error = validateProfilePhoto(file);
  if (error) throw new Error(error);

  const path = `profile_photos/${uid}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}