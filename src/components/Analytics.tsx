import { formatDelta, formatNumber } from "@/lib/format";
import type { MetricDelta, TrafficOverview } from "@/lib/siteguru/types";

function KpiTile({
  label,
  metric,
  format = "number",
}: {
  label: string;
  metric: MetricDelta | undefined;
  format?: "number" | "percent";
}) {
  const value = metric?.value;
  const display =
    value == null
      ? "—"
      : format === "percent"
        ? `${value}%`
        : formatNumber(value);
  const delta = formatDelta(metric?.delta_pct);
  return (
    <div className="kpi">
      <div className="label">{label}</div>
      <div className="value">{display}</div>
      {delta.text && (
        <div className={`delta ${delta.dir === "flat" ? "" : delta.dir}`}>
          {delta.text} vs prior period
        </div>
      )}
    </div>
  );
}

export function TrafficKpis({ traffic }: { traffic: TrafficOverview }) {
  const sc = traffic.search_console;
  const ga = traffic.analytics;
  return (
    <div className="grid kpis">
      <KpiTile label="Sessions" metric={ga?.sessions} />
      <KpiTile label="Users" metric={ga?.users} />
      <KpiTile label="Search clicks" metric={sc?.clicks} />
      <KpiTile label="Impressions" metric={sc?.impressions} />
    </div>
  );
}

export function TrafficPanel({ traffic }: { traffic: TrafficOverview }) {
  const topPages = (traffic.top_pages ?? []).filter(
    (p) => p.clicks > 0 || p.impressions > 0,
  );
  const topQueries = (traffic.top_queries ?? []).filter(
    (q) => q.clicks > 0 || q.impressions > 0,
  );

  return (
    <div className="stack lg">
      {traffic.period_label && (
        <p className="muted tiny">{traffic.period_label} · via SiteGuru (GA4 + Search Console)</p>
      )}
      <TrafficKpis traffic={traffic} />

      <div className="grid cols-2">
        <div className="stack">
          <div className="section-head">
            <h3>Top pages</h3>
            <span className="count">by search clicks</span>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th className="cell-right">Clicks</th>
                  <th className="cell-right">Impr.</th>
                  <th className="cell-right">Avg pos.</th>
                </tr>
              </thead>
              <tbody>
                {topPages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted tiny">
                      No page data.
                    </td>
                  </tr>
                ) : (
                  topPages.map((p) => (
                    <tr key={p.path}>
                      <td className="cell-name">{p.path}</td>
                      <td className="cell-right">{formatNumber(p.clicks)}</td>
                      <td className="cell-right">{formatNumber(p.impressions)}</td>
                      <td className="cell-right">{Math.round(p.avg_position)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="stack">
          <div className="section-head">
            <h3>Top queries</h3>
            <span className="count">by search clicks</span>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Query</th>
                  <th className="cell-right">Clicks</th>
                  <th className="cell-right">Impr.</th>
                  <th className="cell-right">Avg pos.</th>
                </tr>
              </thead>
              <tbody>
                {topQueries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted tiny">
                      No query data.
                    </td>
                  </tr>
                ) : (
                  topQueries.map((q) => (
                    <tr key={q.keyword}>
                      <td className="cell-name">{q.keyword}</td>
                      <td className="cell-right">{formatNumber(q.clicks)}</td>
                      <td className="cell-right">{formatNumber(q.impressions)}</td>
                      <td className="cell-right">{q.avg_position.toFixed(1)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
