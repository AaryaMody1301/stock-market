"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            background: "#0a0a0a",
            color: "#fafafa",
          }}
        >
          <section style={{ width: "100%", maxWidth: "560px", textAlign: "center" }}>
            <h1 style={{ margin: 0, fontSize: "28px", lineHeight: 1.2 }}>Something went wrong</h1>
            <p style={{ marginTop: "12px", color: "#b4b4b4" }}>
              A rendering error occurred. Please try again.
            </p>
            {error?.digest ? (
              <p style={{ marginTop: "8px", color: "#8a8a8a", fontSize: "12px" }}>
                Error ID: {error.digest}
              </p>
            ) : null}
            <button
              onClick={reset}
              style={{
                marginTop: "18px",
                border: 0,
                borderRadius: "8px",
                padding: "10px 14px",
                background: "#2563eb",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
