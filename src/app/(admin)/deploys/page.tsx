export default function DeploysPage() {
  return (
    <div className="page" style={{ padding: 0 }}>
      <div className="page-header">
        <div>
          <div className="eyebrow">Admin</div>
          <h1>Deploys</h1>
          <p className="subtitle">
            A cross-client feed of automated pull requests and deploys.
          </p>
        </div>
      </div>
      <div className="card">
        <div className="empty">
          <h3>Nothing deployed yet</h3>
          <p>
            Once the automation pipeline is enabled, accepted auto-fixes will show
            up here as pull requests and Vercel deploys across all clients.
          </p>
        </div>
      </div>
    </div>
  );
}
