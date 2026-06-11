import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import useAuth from "../../hooks/useAuth";
import styles from "./PulseChart.module.css";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

const PAGE_SIZE = 10;

const SENSORS = [
  { key: "bpm",  label: "Heart Rate",  unit: "bpm",  color: "#2ecc71" },
  { key: "spo2", label: "SpO₂",        unit: "%",    color: "#34d399" },
  { key: "temp", label: "Temperature", unit: "°C",   color: "#a3e635" },
  { key: "pres", label: "Pressure",    unit: "mmHg", color: "#4ade80" },
];

// Normalizează un rând indiferent dacă e flat sau nested
const normalize = row => {
  if (row.data && typeof row.data === "object") return row;
  const { id, patientId, patient, statusGeneral, sensorType, ...rest } = row;
  return { id, patientId, patient, statusGeneral, sensorType, data: rest };
};

function StatBadge({ label, value, unit }) {
  return (
    <div className={styles.statBadge}>
      <span className={styles.statValue}>
        {value ?? "—"}
        {value != null && <span className={styles.statUnit}> {unit}</span>}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function StatusPill({ status }) {
  if (!status) return <span className={styles.pillNeutral}>—</span>;
  const s = status.toLowerCase();
  const cls = s.includes("ok") || s.includes("normal")
    ? styles.pillOk
    : s.includes("warn") || s.includes("alert")
    ? styles.pillWarn
    : styles.pillNeutral;
  return <span className={cls}>{status}</span>;
}

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTime}>{label}</div>
      <div className={styles.tooltipVal}>{payload[0].value?.toFixed(1)} {unit}</div>
    </div>
  );
};

function MiniChart({ data, sensor }) {
  const values = data.map(d => d[sensor.key]).filter(v => v != null);
  const min    = values.length ? Math.min(...values).toFixed(1) : "—";
  const max    = values.length ? Math.max(...values).toFixed(1) : "—";
  const avg    = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : "—";
  const latest = values.length ? values[0].toFixed(1) : "—";

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <div className={styles.chartTitle}>{sensor.label}</div>
          <div className={styles.chartLatest}>
            <span className={styles.chartLatestVal} style={{ color: sensor.color }}>{latest}</span>
            <span className={styles.chartLatestUnit}> {sensor.unit}</span>
          </div>
        </div>
        <div className={styles.chartMeta}>
          <span>min <strong>{min}</strong></span>
          <span>avg <strong>{avg}</strong></span>
          <span>max <strong>{max}</strong></span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={110}>
        <LineChart data={[...data].reverse()} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="time" hide />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip unit={sensor.unit} />} />
          <Line
            type="monotone"
            dataKey={sensor.key}
            stroke={sensor.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: sensor.color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function PulseChart() {
  const { user } = useAuth();
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [page, setPage]       = useState(0);

  useEffect(() => {
    if (!user?.accessToken) { setLoading(false); return; }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const patientId = jwtDecode(user.accessToken)?.patient_id || user.patientId;
        const res = await fetch(
          `http://localhost:8080/api/telemetry/patient/${patientId}`,
          { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        console.log("RAW DATA:", JSON.stringify(data[0], null, 2));
        console.log("FULL RAW:", JSON.stringify(data, null, 2));
        console.log("TYPE:", typeof data, Array.isArray(data), "LENGTH:", data?.length);
        // normalize suportă atât flat cât și nested
        const normalized = (Array.isArray(data) ? data : []).map(normalize);
        setRows(normalized);
        setPage(0);
      } catch (e) {
        setError(e.message || "Could not load telemetry.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const chartData = rows.map(r => ({
    time: r.data?.timestamp
      ? new Date(r.data.timestamp).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })
      : "",
    bpm:  r.data?.bpm  ?? null,
    spo2: r.data?.spo2 ?? null,
    temp: r.data?.temp ?? null,
    pres: r.data?.pres ?? null,
  }));

  const bpmVals  = rows.map(r => r.data?.bpm).filter(Boolean);
  const tempVals = rows.map(r => r.data?.temp).filter(Boolean);
  const spo2Vals = rows.map(r => r.data?.spo2).filter(Boolean);
  const presVals = rows.map(r => r.data?.pres).filter(Boolean);
  const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : null;

  const stats = [
    { label: "Avg BPM",  value: avg(bpmVals)  ? Math.round(avg(bpmVals))  : null, unit: "bpm"  },
    { label: "Avg SpO₂", value: avg(spo2Vals) ? avg(spo2Vals).toFixed(1)  : null, unit: "%"    },
    { label: "Avg Temp", value: avg(tempVals) ? avg(tempVals).toFixed(1)  : null, unit: "°C"   },
    { label: "Avg Pres", value: avg(presVals) ? avg(presVals).toFixed(1)  : null, unit: "mmHg" },
    { label: "Records",  value: rows.length || null,                               unit: ""     },
  ];

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const pageRows   = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const formatTime = ts => {
    if (!ts) return "—";
    const d = new Date(ts);
    return isNaN(d) ? ts : d.toLocaleString("ro-RO", { dateStyle: "short", timeStyle: "medium" });
  };

  return (
    <div className={styles.wrapper}>

      {/* Stats */}
      <div className={styles.statsRow}>
        {stats.map(s => <StatBadge key={s.label} {...s} />)}
      </div>

      {loading ? (
        <div className={styles.card}>
          <div className={styles.center}>
            <div className={styles.spinner} />
            <p className={styles.hint}>Fetching data…</p>
          </div>
        </div>
      ) : error ? (
        <div className={styles.card}>
          <div className={styles.center}><p className={styles.errorText}>{error}</p></div>
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.center}><p className={styles.hint}>No measurements recorded yet.</p></div>
        </div>
      ) : (
        <>
          {/* 2x2 Chart grid */}
          <div className={styles.chartGrid}>
            {SENSORS.map(s => <MiniChart key={s.key} data={chartData} sensor={s} />)}
          </div>

          {/* Table card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Telemetry Log</h2>
                <div className={styles.cardSub}>Last {rows.length} measurements · ESP32</div>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>BPM</th>
                    <th>SpO₂</th>
                    <th>Temp</th>
                    <th>Pressure</th>
                    <th>ECG Status</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row, i) => {
                    const d = row.data || {};
                    return (
                      <tr key={row.id ?? i} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                        <td className={styles.tsCell}>{formatTime(d.timestamp)}</td>
                        <td className={styles.numCell}>{d.bpm  != null ? Math.round(d.bpm)       : "—"}</td>
                        <td className={styles.numCell}>{d.spo2 != null ? `${d.spo2.toFixed(1)}%` : "—"}</td>
                        <td className={styles.numCell}>{d.temp != null ? `${d.temp.toFixed(1)} °C` : "—"}</td>
                        <td className={styles.numCell}>{d.pres != null ? `${d.pres.toFixed(1)}`  : "—"}</td>
                        <td><StatusPill status={d.ecgStatus} /></td>
                        <td><StatusPill status={row.statusGeneral} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>← Prev</button>
              <span className={styles.pageInfo}>Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong></span>
              <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>Next →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}