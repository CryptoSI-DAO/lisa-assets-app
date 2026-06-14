export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <div className="text-5xl">📊</div>
      <h1 className="mt-4 text-3xl font-bold">Project Report</h1>
      <p className="mt-2 text-muted">
        Detailed report for project <code className="text-accent">{params.id}</code>
      </p>
      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-white/5 bg-surface p-8">
        <p className="text-sm text-muted">
          Full agent breakdown, Lisa Coefficient analysis, and trajectory
          prediction will appear here once the backend is live.
        </p>
      </div>
    </div>
  );
}
