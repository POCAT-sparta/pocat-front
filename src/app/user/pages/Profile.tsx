import { User, ShoppingBag, Gavel, LogOut, CreditCard, MapPin, Phone, Mail, Shield, AlertTriangle, Ban, Zap, Wallet, Undo2, MessageSquare, Pencil, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../../auth/context/AuthContext.tsx";
import { useIssueBillingKey } from "@/app/payment/hooks/useIssueBillingKey";
import { updateMe } from "@/api/user/userApi";
import { getMyOrders } from "@/api/order/orderApi";
import { getMyBids } from "@/api/bid/bidApi";
import { getMySettlements } from "@/api/settlement/settlementApi";
import { getMyRefunds } from "@/api/refund/refundApi";
import { statusMeta } from "@/app/order/lib/orderStatus";
import type { OrderListItem } from "@/types/order.types";
import type { MyBidItem, BidStatus } from "@/types/bid.types";
import type { MySettlementItem } from "@/types/settlement.types";
import type { RefundResponse, RefundStatus } from "@/types/admin.types";

const TRAINER_CLASSES = ["견습 트레이너", "정식 트레이너", "상급 트레이너", "엘리트 트레이너", "마스터 트레이너"];

function getTrainerClass(unpaidStrike: number, isBidBlocked: boolean) {
  if (isBidBlocked) return { label: "⛔ 차단됨", color: "text-red-400" };
  if (unpaidStrike >= 3) return { label: TRAINER_CLASSES[0], color: "text-red-400" };
  return { label: TRAINER_CLASSES[4], color: "text-[#FFCB05]" };
}

export function Profile() {
  const { user, isLoading, isAuthenticated, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const { issueBillingKey, isIssuing } = useIssueBillingKey();

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  const [bids, setBids] = useState<MyBidItem[]>([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [bidsLoaded, setBidsLoaded] = useState(false);

  const [settlements, setSettlements] = useState<MySettlementItem[]>([]);
  const [settlementsLoading, setSettlementsLoading] = useState(false);
  const [settlementsLoaded, setSettlementsLoaded] = useState(false);

  const [refunds, setRefunds] = useState<RefundResponse[]>([]);
  const [refundsLoading, setRefundsLoading] = useState(false);
  const [refundsLoaded, setRefundsLoaded] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ nickname: "", phone: "", address: "" });

  useEffect(() => {
    if (activeTab === "buying" && !ordersLoaded) {
      setOrdersLoading(true);
      getMyOrders({ size: 10 })
        .then((page) => setOrders(page.content))
        .catch(() => toast.error("구매 내역을 불러오지 못했습니다."))
        .finally(() => {
          setOrdersLoading(false);
          setOrdersLoaded(true);
        });
    } else if (activeTab === "bids" && !bidsLoaded) {
      setBidsLoading(true);
      getMyBids({ size: 10 })
        .then((page) => setBids(page.content))
        .catch(() => toast.error("입찰 내역을 불러오지 못했습니다."))
        .finally(() => {
          setBidsLoading(false);
          setBidsLoaded(true);
        });
    } else if (activeTab === "settlements" && !settlementsLoaded) {
      setSettlementsLoading(true);
      getMySettlements({ size: 10 })
        .then((page) => setSettlements(page.content))
        .catch(() => toast.error("정산 내역을 불러오지 못했습니다."))
        .finally(() => {
          setSettlementsLoading(false);
          setSettlementsLoaded(true);
        });
    } else if (activeTab === "refunds" && !refundsLoaded) {
      setRefundsLoading(true);
      getMyRefunds({ size: 10 })
        .then((page) => setRefunds(page.content))
        .catch(() => toast.error("환불 내역을 불러오지 못했습니다."))
        .finally(() => {
          setRefundsLoading(false);
          setRefundsLoaded(true);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function handleRegisterCard() {
    if (!user) return;
    const isUpdate = user.hasBillingKey;
    try {
      await issueBillingKey(
        {
          fullName: user.nickname,
          email: user.email,
          phoneNumber: user.phone,
        },
        { isUpdate }
      );
      toast.success(isUpdate ? "카드가 변경되었습니다." : "카드가 등록되었습니다.");
      await refreshUser();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : isUpdate ? "카드 변경에 실패했습니다." : "카드 등록에 실패했습니다."
      );
    }
  }

  function startEditing() {
    if (!user) return;
    setForm({
      nickname: user.nickname,
      phone: user.phone,
      address: user.address ?? "",
    });
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
  }

  async function handleSaveInfo() {
    if (!user) return;

    const nickname = form.nickname.trim();
    const phone = form.phone.trim();
    const address = form.address.trim();

    if (!nickname) {
      toast.error("닉네임을 입력해주세요.");
      return;
    }
    if (!phone) {
      toast.error("휴대폰 번호를 입력해주세요.");
      return;
    }
    if (!/^[0-9-]+$/.test(phone)) {
      toast.error("휴대폰 번호 형식이 올바르지 않습니다.");
      return;
    }

    const payload: { nickname?: string; phone?: string; address?: string } = {};
    if (nickname !== user.nickname) payload.nickname = nickname;
    if (phone !== user.phone) payload.phone = phone;
    if (address !== (user.address ?? "")) payload.address = address;

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateMe(payload);
      await refreshUser();
      toast.success("내 정보가 수정되었습니다.");
      setIsEditing(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "내 정보 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  const tabs = [
    { id: "info",        label: "내 정보",   icon: <User className="w-4 h-4" />         },
    { id: "buying",      label: "구매 내역", icon: <ShoppingBag className="w-4 h-4" />  },
    { id: "bids",        label: "입찰 내역", icon: <Gavel className="w-4 h-4" />        },
    { id: "settlements", label: "정산 내역", icon: <Wallet className="w-4 h-4" />       },
    { id: "refunds",     label: "환불 내역", icon: <Undo2 className="w-4 h-4" />        },
  ];

  async function handleLogout() {
    try {
      await logout();
      toast.success("로그아웃 되었습니다.");
      navigate("/");
    } catch {
      toast.error("로그아웃에 실패했습니다.");
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">불러오는 중...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔐</div>
          <h2 className="text-xl font-bold">로그인이 필요합니다</h2>
          <p className="text-muted-foreground text-sm">프로필을 보려면 로그인해주세요.</p>
          <Link
            to="/login"
            className="inline-block bg-[#CC0000] hover:bg-[#aa0000] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  const trainerClass = getTrainerClass(user.unpaidStrike, user.isBidBlocked);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white border-b border-white/10">
        {/* Decorative pokéballs */}
        <div className="relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full border-[20px] border-white/5 pointer-events-none" />
          <div className="absolute -bottom-6 right-24 w-28 h-28 rounded-full border-[12px] border-white/5 pointer-events-none" />

          <div className="relative container mx-auto px-4 py-10 max-w-4xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-full bg-[#FFCB05] flex items-center justify-center text-[#1a1a2e] font-extrabold text-3xl shadow-lg shadow-yellow-500/30">
                    {user.nickname[0]?.toUpperCase()}
                  </div>
                  {user.role === "ADMIN" && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#CC0000] rounded-full flex items-center justify-center text-[9px] text-white font-bold border-2 border-[#1a1a2e]">
                      ★
                    </div>
                  )}
                </div>

                {/* Name + class */}
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-0.5 ${trainerClass.color}`}>
                    {trainerClass.label}
                  </p>
                  <h1 className="text-2xl font-extrabold text-white leading-none">{user.nickname}</h1>
                  <p className="text-white/50 text-sm mt-1">{user.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {user.role === "ADMIN" && (
                      <span className="text-[10px] bg-[#CC0000]/20 text-[#CC0000] border border-[#CC0000]/30 px-2 py-0.5 rounded-full font-medium">
                        관리자
                      </span>
                    )}
                    {user.isBidBlocked && (
                      <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Ban className="w-2.5 h-2.5" /> 입찰 차단
                      </span>
                    )}
                    {user.unpaidStrike > 0 && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> 패널티 {user.unpaidStrike}회
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>

            {/* Quick nav */}
            <div className="flex flex-wrap gap-2 mt-6">
              <Link
                to="/my-auctions"
                className="flex items-center gap-1.5 bg-[#CC0000] hover:bg-[#aa0000] text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
              >
                <Zap className="w-3.5 h-3.5" /> 내 경매
              </Link>
              <Link
                to="/orders"
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> 내 주문
              </Link>
              <Link
                to="/chats"
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" /> 내 채팅
              </Link>
              <Link
                to="/auctions/new"
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
              >
                + 경매 등록
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card border rounded-2xl overflow-hidden">

          {/* Tab bar */}
          <div className="border-b border-border flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#CC0000] text-[#CC0000]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">

            {/* ── 내 정보 ───────────────────────────────────────────────── */}
            {activeTab === "info" && (
              <div className="max-w-lg space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">기본 정보</h3>
                  {!isEditing ? (
                    <button
                      onClick={startEditing}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> 수정
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={cancelEditing}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" /> 취소
                      </button>
                      <button
                        onClick={handleSaveInfo}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 text-xs text-white bg-[#CC0000] hover:bg-[#aa0000] px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" /> {isSaving ? "저장 중..." : "저장"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoCard icon={<Mail className="w-4 h-4 text-[#FFCB05]" />}   label="이메일"   value={user.email} />
                  {isEditing ? (
                    <>
                      <EditCard
                        icon={<User className="w-4 h-4 text-[#FFCB05]" />}
                        label="닉네임"
                        value={form.nickname}
                        onChange={(v) => setForm((f) => ({ ...f, nickname: v }))}
                      />
                      <EditCard
                        icon={<Phone className="w-4 h-4 text-[#FFCB05]" />}
                        label="휴대폰"
                        value={form.phone}
                        onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                        placeholder="010-0000-0000"
                      />
                      <EditCard
                        icon={<MapPin className="w-4 h-4 text-[#FFCB05]" />}
                        label="주소"
                        value={form.address}
                        onChange={(v) => setForm((f) => ({ ...f, address: v }))}
                        placeholder="주소를 입력하세요"
                      />
                    </>
                  ) : (
                    <>
                      <InfoCard icon={<User className="w-4 h-4 text-[#FFCB05]" />}   label="닉네임"   value={user.nickname} />
                      <InfoCard icon={<Phone className="w-4 h-4 text-[#FFCB05]" />}  label="휴대폰"   value={user.phone} />
                      <InfoCard icon={<MapPin className="w-4 h-4 text-[#FFCB05]" />} label="주소"     value={user.address ?? "미등록"} />
                    </>
                  )}
                  <InfoCard
                    icon={<CreditCard className="w-4 h-4 text-[#FFCB05]" />}
                    label="계좌"
                    value={user.bankAccount ? `${user.bankName} ${user.bankAccount}` : "미등록"}
                  />
                  <InfoCard
                    icon={<Shield className="w-4 h-4 text-[#FFCB05]" />}
                    label="빌링키"
                    value={user.hasBillingKey ? "✅ 등록됨" : "미등록"}
                  />
                </div>

                <div className="border-t pt-5">
                  <button
                    onClick={handleRegisterCard}
                    disabled={isIssuing}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    {isIssuing ? "등록 중..." : user.hasBillingKey ? "카드 변경" : "카드 등록"}
                  </button>
                </div>

                <div className="border-t pt-5 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">계정 상태</h3>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge
                      label={`미결제 패널티 ${user.unpaidStrike}회`}
                      variant={user.unpaidStrike === 0 ? "ok" : user.unpaidStrike >= 3 ? "danger" : "warn"}
                    />
                    <StatusBadge
                      label={user.isBidBlocked ? "입찰 차단 중" : "입찰 정상"}
                      variant={user.isBidBlocked ? "danger" : "ok"}
                    />
                    <StatusBadge
                      label={user.role === "ADMIN" ? "관리자 계정" : "일반 회원"}
                      variant={user.role === "ADMIN" ? "admin" : "ok"}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    가입일: {user.createdAt.slice(0, 10)}
                  </p>
                </div>
              </div>
            )}

            {/* ── 구매 내역 ──────────────────────────────────────────────── */}
            {activeTab === "buying" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Link to="/orders" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    전체 주문 내역 보기 →
                  </Link>
                </div>
                {ordersLoading ? (
                  <SkeletonList />
                ) : orders.length === 0 ? (
                  <EmptyTab emoji="🛍️" title="구매 내역이 없습니다" desc="낙찰된 경매가 생기면 여기에 표시됩니다." />
                ) : (
                  <ul className="space-y-3">
                    {orders.map((order) => {
                      const meta = statusMeta(order.orderStatus);
                      return (
                        <li key={order.orderUid}>
                          <Link
                            to={`/orders/${order.orderUid}`}
                            state={{ auctionId: order.auctionId }}
                            className="bg-muted/40 rounded-xl px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/60 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="font-medium truncate">{order.cardName}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{order.createdAt.slice(0, 10)}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${meta.className}`}>
                                {meta.label}
                              </span>
                              <span className="text-sm font-extrabold text-[#CC0000]">
                                {order.finalPrice.toLocaleString()}원
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* ── 입찰 내역 ──────────────────────────────────────────────── */}
            {activeTab === "bids" && (
              <div className="space-y-4">
                {bidsLoading ? (
                  <SkeletonList />
                ) : bids.length === 0 ? (
                  <EmptyTab emoji="⚡" title="입찰 내역이 없습니다" desc="경매에 입찰하면 여기에 기록됩니다." />
                ) : (
                  <ul className="space-y-3">
                    {bids.map((bid) => {
                      const meta = bidStatusMeta(bid.status);
                      return (
                        <li key={bid.bidId}>
                          <Link
                            to={`/auctions/${bid.auctionId}`}
                            className="bg-muted/40 rounded-xl px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/60 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="font-medium truncate">{bid.auctionTitle}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{bid.createdAt.slice(0, 10)}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <StatusBadge label={meta.label} variant={meta.variant} />
                              <span className="text-sm font-extrabold text-[#CC0000]">
                                {bid.bidPrice.toLocaleString()}원
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* ── 정산 내역 ──────────────────────────────────────────────── */}
            {activeTab === "settlements" && (
              <div className="space-y-4">
                {settlementsLoading ? (
                  <SkeletonList />
                ) : settlements.length === 0 ? (
                  <EmptyTab emoji="💰" title="정산 내역이 없습니다" desc="판매한 카드가 정산되면 여기에 표시됩니다." />
                ) : (
                  <ul className="space-y-3">
                    {settlements.map((settlement) => {
                      const meta = settlementStatusMeta(settlement.status);
                      const date = settlement.settledAt ?? settlement.createdAt;
                      return (
                        <li
                          key={settlement.settlementUid}
                          className="bg-muted/40 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {settlement.cardImageUrl && (
                              <div className="w-10 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                                <img
                                  src={settlement.cardImageUrl}
                                  alt={settlement.cardName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium truncate">{settlement.cardName}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {settlement.cardGrade} · {date.slice(0, 10)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <StatusBadge label={meta.label} variant={meta.variant} />
                            <div className="text-right">
                              <p className="text-sm font-extrabold text-[#CC0000]">
                                {settlement.sellerAmount.toLocaleString()}원
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                ({settlement.platformFee.toLocaleString()}원 수수료)
                              </p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* ── 환불 내역 ──────────────────────────────────────────────── */}
            {activeTab === "refunds" && (
              <div className="space-y-4">
                {refundsLoading ? (
                  <SkeletonList />
                ) : refunds.length === 0 ? (
                  <EmptyTab emoji="↩️" title="환불 내역이 없습니다" desc="환불이 발생하면 여기에 표시됩니다." />
                ) : (
                  <ul className="space-y-3">
                    {refunds.map((refund) => {
                      const meta = refundStatusMeta(refund.status);
                      return (
                        <li
                          key={refund.refundId}
                          className="bg-muted/40 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="font-medium truncate">{refund.reason}</p>
                            {refund.status === "REJECTED" && refund.rejectReason && (
                              <p className="text-[10px] text-red-500 mt-0.5 truncate">{refund.rejectReason}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">{refund.createdAt.slice(0, 10)}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <StatusBadge label={meta.label} variant={meta.variant} />
                            <span className="text-sm font-extrabold text-[#CC0000]">
                              {refund.amount.toLocaleString()}원
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-muted/40 rounded-xl px-4 py-3 flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function EditCard({
  icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="bg-muted/40 rounded-xl px-4 py-3 flex items-start gap-3 ring-1 ring-[#CC0000]/20">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5 block">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-medium outline-none border-b border-border focus:border-[#CC0000] transition-colors pb-0.5"
        />
      </div>
    </div>
  );
}

function StatusBadge({ label, variant }: { label: string; variant: "ok" | "warn" | "danger" | "admin" | "neutral" }) {
  const cls = {
    ok:      "bg-green-500/10 text-green-500 border-green-500/20",
    warn:    "bg-amber-500/10 text-amber-500 border-amber-500/20",
    danger:  "bg-red-500/10 text-red-500 border-red-500/20",
    admin:   "bg-[#CC0000]/10 text-[#CC0000] border-[#CC0000]/20",
    neutral: "bg-muted text-muted-foreground border-border",
  }[variant];
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${cls}`}>{label}</span>
  );
}

function EmptyTab({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="text-center py-14 space-y-2">
      <div className="text-5xl">{emoji}</div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded-xl" />
      ))}
    </div>
  );
}

function bidStatusMeta(status: BidStatus): { label: string; variant: "ok" | "warn" | "danger" | "admin" | "neutral" } {
  switch (status) {
    case "LEADING":
      return { label: "입찰 중", variant: "ok" };
    case "OUTBID":
      return { label: "역전당함", variant: "warn" };
    case "WON":
      return { label: "낙찰", variant: "admin" };
    case "LOST":
      return { label: "패찰", variant: "neutral" };
    case "CANCELLED":
    default:
      return { label: "취소됨", variant: "neutral" };
  }
}

function settlementStatusMeta(status: MySettlementItem["status"]): { label: string; variant: "ok" | "warn" | "danger" | "admin" | "neutral" } {
  switch (status) {
    case "PENDING":
      return { label: "정산 대기", variant: "warn" };
    case "COMPLETED":
      return { label: "정산 완료", variant: "ok" };
    case "REFUNDED":
    default:
      return { label: "환불됨", variant: "danger" };
  }
}

function refundStatusMeta(status: RefundStatus): { label: string; variant: "ok" | "warn" | "danger" | "admin" | "neutral" } {
  switch (status) {
    case "REQUESTED":
      return { label: "요청됨", variant: "warn" };
    case "PROCESSING":
      return { label: "처리 중", variant: "warn" };
    case "COMPLETED":
      return { label: "환불 완료", variant: "ok" };
    case "REJECTED":
      return { label: "거절됨", variant: "danger" };
    case "FAILED_RETRYABLE":
      return { label: "재시도 예정", variant: "warn" };
    case "FAILED_FINAL":
    default:
      return { label: "처리 실패", variant: "danger" };
  }
}
