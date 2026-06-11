import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

/** 페이지 제목 + 우측 액션 영역 */
export function AdminPageHeader({ title, count, children }: { title: string; count?: number; children?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {count !== undefined && (
          <p className="text-sm text-white/40 mt-1">총 {count.toLocaleString()}건</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

/** 테이블 컨테이너 (카드 + 가로 스크롤) */
export function AdminPanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a1a2e] overflow-hidden">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

/** 로딩 / 빈 상태 표시 */
export function AdminState({ loading, empty, emptyText = "데이터가 없습니다." }: { loading: boolean; empty: boolean; emptyText?: string }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#FFCB05] animate-spin" />
      </div>
    );
  }
  if (empty) {
    return <div className="py-20 text-center text-sm text-white/40">{emptyText}</div>;
  }
  return null;
}

/** 0-based 페이지네이션 (이전/다음) */
export function AdminPagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button
        disabled={page <= 0}
        onClick={() => onChange(page - 1)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-white/5 text-white/70 enabled:hover:bg-white/10 disabled:opacity-30 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> 이전
      </button>
      <span className="text-sm text-white/50">
        {page + 1} / {totalPages}
      </span>
      <button
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-white/5 text-white/70 enabled:hover:bg-white/10 disabled:opacity-30 transition-colors"
      >
        다음 <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/** 상태 배지 */
export function StatusBadge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "green" | "red" | "yellow" | "blue" }) {
  const tones: Record<string, string> = {
    default: "bg-white/10 text-white/60",
    green: "bg-green-500/15 text-green-400",
    red: "bg-red-500/15 text-red-400",
    yellow: "bg-yellow-500/15 text-yellow-400",
    blue: "bg-blue-500/15 text-blue-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
