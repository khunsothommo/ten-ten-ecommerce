import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="not-found-wrapper text-white">
      <h1>404</h1>
      <h3 className="mb-3">Page Not Found</h3>
      <p className="text-white-50 mb-4">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-custom btn-lg">
        Back to Home
      </Link>
    </div>
  );
}
