export default function DashboardCard({ icon, label, value, hint }) {
  return (
    <div className="dashboard-card d-flex align-items-center gap-3">
      <div
        className="d-flex align-items-center justify-content-center rounded-circle bg-white bg-opacity-10"
        style={{ width: 54, height: 54, fontSize: '1.5rem' }}
      >
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <div className="text-white-50 small">{label}</div>
        <div className="fs-3 fw-bold">{value}</div>
        {hint && <div className="text-white-50 small">{hint}</div>}
      </div>
    </div>
  );
}
