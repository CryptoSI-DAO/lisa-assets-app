export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
      <div className="text-5xl">🔐</div>
      <h1 className="mt-4 text-3xl font-bold">Sign In</h1>
      <p className="mt-2 text-muted">Authentication coming soon.</p>
      <div className="mt-8 rounded-2xl border border-white/5 bg-surface p-8">
        <p className="text-sm text-muted">
          Login via wallet or email will be available here once the auth backend
          is connected.
        </p>
      </div>
    </div>
  );
}
