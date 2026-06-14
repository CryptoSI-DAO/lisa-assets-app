export default function AgentScoreBar({
  agentName,
  emoji,
  score,
}: {
  agentName: string;
  emoji: string;
  score: number;
}) {
  const pct = Math.min(100, Math.max(0, (score / 10) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <span>{emoji}</span>
          <span className="font-medium">{agentName}</span>
        </span>
        <span className="font-bold text-accent">{score.toFixed(1)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-lighter">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
