export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <div className="text-5xl">📈</div>
      <h1 className="mt-4 text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted">
        Your reports, subscriptions, and saved projects.
      </p>
      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-white/5 bg-surface p-8">
        <p className="text-sm text-muted">
          Sign in to view your purchased reports, track coefficient changes,
          and manage your subscriptions.
        </p>
      </div>
    </div>
  );
}
