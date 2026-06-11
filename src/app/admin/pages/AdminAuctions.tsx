import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { getAdminAuctions } from "@/api/admin";
import type { AdminAuctionResponse } from "@/types/admin.types";
import type { AuctionStatus } from "@/types/auction.types";
import type { CardGrade } from "@/types/card.types";
import {
  AdminPageHeader,
  AdminPanel,
  AdminState,
  AdminPagination,
  StatusBadge,
} from "../components/AdminUI";

const PAGE_SIZE = 20;

const STATUS_FILTERS: { label: string; value?: AuctionStatus }[] = [
  { label: "전체" },
  { label: "검수중", value: "INSPECTING" },
  { label: "진행중", value: "ACTIVE" },
  { label: "종료",   value: "ENDED" },
  { label: "취소",   value: "CANCELLED" },
];

const GRADE_FILTERS: { label: string; value?: CardGrade }[] = [
  { label: "전체 등급" },
  { label: "PSA 10", value: "PSA_10" },
  { label: "PSA 9",  value: "PSA_9" },
  { label: "BGS 10", value: "BGS_10" },
];

const STATUS_TONE: Record<AuctionStatus, "default" | "green" | "red" | "yellow" | "blue"> = {
  PENDING:         "default",
  INSPECTING:      "yellow",
  REJECTED:        "red",
  ACTIVE:          "green",
  ENDED:           "blue",
  NO_BIDDER:       "default",
  CANCELLED:       "red",
  PAYMENT_PENDING: "yellow",
};

const STATUS_LABEL: Record<AuctionStatus, string> = {
  PENDING:         "대기",
  INSPECTING:      "검수중",
  REJECTED:        "반려",
  ACTIVE:          "진행중",
  ENDED:           "종료",
  NO_BIDDER:       "유찰",
  CANCELLED:       "취소",
  PAYMENT_PENDING: "결제대기",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function won(n: number | null) {
  return n === null ? "—" : `${n.toLocaleString()}원`;
}

export function AdminAuctions() {
  const [auctions, setAuctions] = useState<AdminAuctionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<AuctionStatus | undefined>(undefined);
  const [grade, setGrade] = useState<CardGrade | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getAdminAuctions({ keyword: keyword || undefined, status, grade, page, size: PAGE_SIZE })
      .then((res) => {
        if (!alive) return;
        setAuctions(res.content);
        setTotalPages(res.totalPages);
        setTotal(res.totalElements);
      })
      .catch(() => alive && toast.error("경매 목록을 불러오지 못했습니다."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [keyword, status, grade, page]);

  function applySearch() {
    setPage(0);
    setKeyword(input.trim());
  }

  return (
    <div>
      <AdminPageHeader title="경매 관리" count={total} />

      {/* 검색 */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            placeholder="제목 / 카드명 / 판매자 검색"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1a1a2e] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFCB05]/50"
          />
        </div>
        <button
          onClick={applySearch}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#FFCB05] text-[#1a1a2e] hover:brightness-95 transition"
        >
          검색
        </button>
        <select
          value={grade ?? ""}
          onChange={(e) => { setPage(0); setGrade((e.target.value || undefined) as CardGrade | undefined); }}
          className="px-3 py-2 rounded-xl bg-[#1a1a2e] border border-white/10 text-sm text-white/80 focus:outline-none focus:border-[#FFCB05]/50"
        >
          {GRADE_FILTERS.map((g) => (
            <option key={g.label} value={g.value ?? ""}>{g.label}</option>
          ))}
        </select>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.value;
          return (
            <button
              key={f.label}
              onClick={() => { setPage(0); setStatus(f.value); }}
              className={`px-3 py-2 rounded-xl text-sm transition ${
                active ? "bg-[#FFCB05] text-[#1a1a2e] font-semibold" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <AdminPanel>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 border-b border-white/10">
              <th className="px-4 py-3 font-medium">경매</th>
              <th className="px-4 py-3 font-medium">판매자</th>
              <th className="px-4 py-3 font-medium">등급</th>
              <th className="px-4 py-3 font-medium text-right">시작가</th>
              <th className="px-4 py-3 font-medium text-right">현재가</th>
              <th className="px-4 py-3 font-medium text-right">즉구가</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">종료</th>
            </tr>
          </thead>
          <tbody>
            {auctions.map((a) => (
              <tr key={a.auctionId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {a.cardImageUrl
                      ? <img src={a.cardImageUrl} alt={a.cardName} className="w-9 h-12 object-cover rounded-md bg-white/5 shrink-0" />
                      : <div className="w-9 h-12 rounded-md bg-white/5 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate max-w-[180px]">{a.title}</p>
                      <p className="text-white/30 text-xs truncate max-w-[180px]">{a.cardName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/70">{a.sellerNickname}</td>
                <td className="px-4 py-3 text-white/60">{a.grade.replace("_", " ")}</td>
                <td className="px-4 py-3 text-right text-white/60">{won(a.startingPrice)}</td>
                <td className="px-4 py-3 text-right text-white font-medium">{won(a.highestPrice)}</td>
                <td className="px-4 py-3 text-right text-white/60">{won(a.buyoutPrice)}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={STATUS_TONE[a.status]}>{STATUS_LABEL[a.status]}</StatusBadge>
                </td>
                <td className="px-4 py-3 text-white/50">{formatDate(a.endedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <AdminState loading={loading} empty={auctions.length === 0} emptyText="경매가 없습니다." />
      </AdminPanel>

      <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
