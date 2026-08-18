const rawList = import.meta.env.VITE_ADMIN_EMAILS || '';

export const adminAllowlist = rawList
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAllowedAdminEmail(email) {
  if (!email) return false;
  if (adminAllowlist.length === 0) return true;
  return adminAllowlist.includes(email.trim().toLowerCase());
}