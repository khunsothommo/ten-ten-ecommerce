export function friendlyFirestoreError(err) {
  const code = err?.code || '';
  const map = {
    'permission-denied':
      "We couldn't complete that action. Please make sure you're logged in and try again.",
    unavailable: 'Connection issue — please check your internet and try again.',
    'deadline-exceeded': 'The request took too long. Please try again.',
    'resource-exhausted': 'Too many requests right now. Please try again in a moment.',
  };
  return map[code] || err?.message || 'Something went wrong. Please try again.';
}