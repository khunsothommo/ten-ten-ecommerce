export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="spinner-wrapper">
      <div className="text-center">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">{label}</span>
        </div>
        <p className="mt-3 text-white-50">{label}</p>
      </div>
    </div>
  );
}
