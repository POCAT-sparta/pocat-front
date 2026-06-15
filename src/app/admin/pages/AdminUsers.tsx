import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { getAdminUsers } from "@/api/admin";
import type { AdminUserResponse } from "@/types/admin.types";
import { formatKST } from "@/shared/lib/datetime";
import {
  AdminPageHeader,
  AdminPanel,
  AdminState,
  AdminPagination,
  StatusBadge,
} from "../components/AdminUI";

const PAGE_SIZE = 20;

const BLOCK_FILTERS: { label: string; value?: boolean }[] = [
  { label: "전체" },
  { label: "입찰차단" , value: true  },
  { label: "정상"     , value: false },
];

function formatDate(iso: string) {
  return formatKST(iso, { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  // 입력값(input) vs 실제 적용된 검색어(keyword) 분리
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [blocked, setBlocked] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getAdminUsers({ keyword: keyword || undefined, isBidBlocked: blocked, page, size: PAGE_SIZE })
      .then((res) => {
        if (!alive) return;
        setUsers(res.content);
        setTotalPages(res.totalPages);
        setTotal(res.totalElements);
      })
      .catch(() => alive && toast.error("회원 목록을 불러오지 못했습니다."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [keyword, blocked, page]);

  function applySearch() {
    setPage(0);
    setKeyword(input.trim());
  }

  return (
    <div>
      <AdminPageHeader title="회원 관리" count={total} />

      {/* 필터 */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            placeholder="이메일 / 닉네임 검색"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1a1a2e] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFCB05]/50"
          />
        </div>
        <button
          onClick={applySearch}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#FFCB05] text-[#1a1a2e] hover:brightness-95 transition"
        >
          검색
        </button>

        <div className="flex gap-1 ml-auto">
          {BLOCK_FILTERS.map((f) => {
            const active = blocked === f.value;
            return (
              <button
                key={f.label}
                onClick={() => { setPage(0); setBlocked(f.value); }}
                className={`px-3 py-2 rounded-xl text-sm transition ${
                  active ? "bg-[#FFCB05] text-[#1a1a2e] font-semibold" : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <AdminPanel>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 border-b border-white/10">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">이메일</th>
              <th className="px-4 py-3 font-medium">닉네임</th>
              <th className="px-4 py-3 font-medium">전화</th>
              <th className="px-4 py-3 font-medium">권한</th>
              <th className="px-4 py-3 font-medium text-center">미납</th>
              <th className="px-4 py-3 font-medium text-center">입찰차단</th>
              <th className="px-4 py-3 font-medium text-center">빌링키</th>
              <th className="px-4 py-3 font-medium">가입일</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-white/40">{u.id}</td>
                <td className="px-4 py-3 text-white/80">{u.email}</td>
                <td className="px-4 py-3 text-white font-medium">{u.nickname}</td>
                <td className="px-4 py-3 text-white/50">{u.phone}</td>
                <td className="px-4 py-3">
                  {u.role === "ADMIN"
                    ? <StatusBadge tone="blue">ADMIN</StatusBadge>
                    : <StatusBadge>USER</StatusBadge>}
                </td>
                <td className="px-4 py-3 text-center">
                  {u.unpaidStrike > 0
                    ? <StatusBadge tone="yellow">{u.unpaidStrike}</StatusBadge>
                    : <span className="text-white/30">0</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {u.isBidBlocked
                    ? <StatusBadge tone="red">차단</StatusBadge>
                    : <span className="text-white/30">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {u.hasBillingKey
                    ? <StatusBadge tone="green">등록</StatusBadge>
                    : <span className="text-white/30">—</span>}
                </td>
                <td className="px-4 py-3 text-white/50">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <AdminState loading={loading} empty={users.length === 0} emptyText="회원이 없습니다." />
      </AdminPanel>

      <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
