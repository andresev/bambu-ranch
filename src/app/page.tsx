"use client";
import useWebSocket from "../hooks/useWebSocket";

export default function Home() {
  const data = useWebSocket() as any;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1>Device Data</h1>
        {data ? (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <p>No data received yet...</p>
        )}
      </div>
    </main>
  );
}
