import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { getAdminOrders } from "@/api/admin";
import type { AdminOrderResponse } from "@/types/admin.types";
import type { OrderStatus } from "@/types/order.types";
import {
  AdminPageHeader,
  AdminPanel,
  AdminState,
  AdminPagination,
  StatusBadge,
} from "../components/AdminUI";

const PAGE_SIZE = 20;

const STATUS_FILTERS: { label: string; value?: OrderStatus }[] = [
  { label: "전체" },
  { label: "결제대기", value: "PAYMENT_PENDING" },
  { label: "결제완료", value: "PAYMENT_COMPLETED" },
  { label: "배송중",   value: "SHIPPING" },
  { label: "거래완료", value: "ORDER_COMPLETED" },
  { label: "취소",     value: "CANCELLED" },
  { label: "환불",     value: "REFUNDED" },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  PAYMENT_PENDING:        "결제대기",
  AUTO_PAYMENT_FAILED:    "자동결제실패",
  DIRECT_PAYMENT_FAILED:  "직접결제실패",
  CANCELLED:              "취소",
  PAYMENT_COMPLETED:      "결제완료",
  SHIPPING:               "배송중",
  SHIPPING_COMPLETED:     "배송완료",
  ORDER_COMPLETED:        "거래완료",
  REFUNDED:               "환불",
};

const STATUS_TONE: Record<OrderStatus, "default" | "green" | "red" | "yellow" | "blue"> = {
  PAYMENT_PENDING:        "yellow",
  AUTO_PAYMENT_FAILED:    "red",
  DIRECT_PAYMENT_FAILED:  "red",
  CANCELLED:              "red",
  PAYMENT_COMPLETED:      "blue",
  SHIPPING:               "blue",
  SHIPPING_COMPLETED:     "green",
  ORDER_COMPLETED:        "green",
  REFUNDED:               "default",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [buyerInput, setBuyerInput] = useState("");
  const [sellerInput, setSellerInput] = useState("");
  const [buyer, setBuyer] = useState("");
  const [seller, setSeller] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getAdminOrders({
      orderStatus: status,
      buyerNickname: buyer || undefined,
      sellerNickname: seller || undefined,
      page,
      size: PAGE_SIZE,
    })
      .then((res) => {
        if (!alive) return;
        setOrders(res.content);
        setTotalPages(res.totalPages);
        setTotal(res.totalElements);
      })
      .catch(() => alive && toast.error("주문 목록을 불러오지 못했습니다."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [status, buyer, seller, page]);

  function applySearch() {
    setPage(0);
    setBuyer(buyerInput.trim());
    setSeller(sellerInput.trim());
  }

  return (
    <div>
      <AdminPageHeader title="주문 관리" count={total} />

      {/* 검색 */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="relative min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={buyerInput}
            onChange={(e) => setBuyerInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            placeholder="구매자 닉네임"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1a1a2e] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFCB05]/50"
          />
        </div>
        <div className="relative min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={sellerInput}
            onChange={(e) => setSellerInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            placeholder="판매자 닉네임"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1a1a2e] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFCB05]/50"
          />
        </div>
        <button
          onClick={applySearch}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#FFCB05] text-[#1a1a2e] hover:brightness-95 transition"
        >
          검색
        </button>
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
              <th className="px-4 py-3 font-medium">주문번호</th>
              <th className="px-4 py-3 font-medium">카드</th>
              <th className="px-4 py-3 font-medium">구매자</th>
              <th className="px-4 py-3 font-medium">판매자</th>
              <th className="px-4 py-3 font-medium text-right">최종가</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">주문일</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.orderId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-white/40 font-mono text-xs">{o.orderUid}</td>
                <td className="px-4 py-3">
                  <p className="text-white font-medium truncate max-w-[180px]">{o.cardName}</p>
                  <p className="text-white/30 text-xs">{o.cardGrade.replace("_", " ")}</p>
                </td>
                <td className="px-4 py-3 text-white/70">{o.buyerNickname}</td>
                <td className="px-4 py-3 text-white/70">{o.sellerNickname}</td>
                <td className="px-4 py-3 text-right text-white font-medium">{o.finalPrice.toLocaleString()}원</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</StatusBadge>
                </td>
                <td className="px-4 py-3 text-white/50">{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <AdminState loading={loading} empty={orders.length === 0} emptyText="주문이 없습니다." />
      </AdminPanel>

      <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
