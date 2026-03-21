import { ChecklistItem } from "@/lib/schemas";

interface ChecklistCardProps {
  items: ChecklistItem[];
}

const STATUS_CONFIG = {
  pass: { icon: "✓", color: "text-green-700", bg: "bg-green-100", label: "통과" },
  fail: { icon: "✗", color: "text-red-700", bg: "bg-red-100", label: "불합격" },
  unknown: { icon: "?", color: "text-slate-500", bg: "bg-slate-100", label: "미확인" },
  info: { icon: "i", color: "text-blue-700", bg: "bg-blue-100", label: "정보" },
};

export function ChecklistCard({ items }: ChecklistCardProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">세부 체크리스트</h2>
      <ul className="space-y-3" role="list">
        {items.map((item, i) => {
          const config = STATUS_CONFIG[item.status];
          return (
            <li
              key={i}
              className="flex items-center gap-3"
              aria-label={`${item.label}: ${item.value} - ${config.label}`}
            >
              <span
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold flex-shrink-0 ${config.bg} ${config.color}`}
                aria-hidden="true"
              >
                {config.icon}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <span className="mx-2 text-slate-300" aria-hidden="true">—</span>
                <span className="text-sm text-slate-600">{item.value}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
