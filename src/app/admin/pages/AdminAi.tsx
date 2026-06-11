import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { reindexAi } from "@/api/admin";
import { AdminPageHeader } from "../components/AdminUI";

/**
 * AI 운영. 백엔드 AI 엔드포인트는 재색인(POST /admin/ai/reindex) 액션 하나뿐이라
 * 조회 화면이 없다. 재색인은 비동기로 실행되어 즉시 202 를 반환한다.
 */
export function AdminAi() {
  const [running, setRunning] = useState(false);

  async function handleReindex() {
    if (!window.confirm("활성 카드 전체를 벡터 스토어에 재색인합니다.\n시간이 걸릴 수 있으며 백그라운드에서 실행됩니다. 진행할까요?")) {
      return;
    }
    setRunning(true);
    try {
      await reindexAi();
      toast.success("재색인 요청이 접수되었습니다. 백그라운드에서 처리됩니다.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "재색인 요청에 실패했습니다.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="AI 운영" />

      <div className="rounded-2xl border border-white/10 bg-[#1a1a2e] p-6 max-w-xl">
        <h2 className="text-white font-semibold mb-1">벡터 스토어 재색인</h2>
        <p className="text-sm text-white/50 leading-relaxed mb-5">
          활성 상태의 모든 카드를 AI 검색용 벡터 스토어에 다시 색인합니다.
          카드 데이터를 대량으로 동기화했거나 검색 결과가 누락될 때 실행하세요.
          비동기로 처리되며 요청 즉시 접수만 확인됩니다.
        </p>
        <button
          onClick={handleReindex}
          disabled={running}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#FFCB05] text-[#1a1a2e] hover:brightness-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running
            ? <><Loader2 className="w-4 h-4 animate-spin" /> 요청 중...</>
            : <><RefreshCw className="w-4 h-4" /> 전체 재색인 실행</>}
        </button>
      </div>
    </div>
  );
}
