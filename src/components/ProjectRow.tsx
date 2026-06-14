import type { Project } from "@/lib/types";

export default function ProjectRow({
  project,
}: {
  project: Project;
}) {
  const isPositive = project.change >= 0;
  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-surface-lighter">
      {/* Desktop layout */}
      <td className="hidden px-4 py-4 text-sm text-muted sm:table-cell">
        {project.rank}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
            style={{ background: project.logo }}
          >
            {project.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="font-semibold">{project.name}</div>
            <div className="text-xs text-muted sm:hidden">
              {project.symbol}
            </div>
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-4 text-sm text-muted sm:table-cell">
        {project.symbol}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-accent">{project.coefficient}</span>
          <span
            className={`text-xs ${isPositive ? "text-green-400" : "text-red-400"}`}
          >
            {isPositive ? "▲" : "▼"} {Math.abs(project.change)}
          </span>
        </div>
      </td>
      <td className="hidden px-4 py-4 text-sm text-muted sm:table-cell">
        {project.updated}
      </td>
    </tr>
  );
}
