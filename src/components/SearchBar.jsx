export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="input-group" style={{ maxWidth: 320 }}>
      <span className="input-group-text bg-transparent text-white border-secondary">
        <i className="bi bi-search" />
      </span>
      <input
        type="text"
        className="form-control bg-transparent text-white border-secondary"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
