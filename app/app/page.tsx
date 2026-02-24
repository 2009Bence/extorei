export default function AppHomePage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0, fontSize: 28, fontWeight: 900 }}>
        BeautySuite Dashboard
      </h1>
      <p style={{ opacity: 0.75, maxWidth: 640 }}>
        Ez a /app kezdőoldala. Ide jön a naptár, vendégek, szolgáltatások, fizetések,
        marketing és riportok.
      </p>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {[
          ["Mai foglalások", "0"],
          ["Bevétel (hó)", "0 Ft"],
          ["Új vendégek", "0"],
          ["No-show", "0"],
        ].map(([t, v]) => (
          <div
            key={t}
            style={{
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              padding: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontSize: 12, letterSpacing: "0.12em", opacity: 0.6, textTransform: "uppercase" }}>
              {t}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, marginTop: 10 }}>
              {v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
