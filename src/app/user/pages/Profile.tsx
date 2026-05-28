import { User, ShoppingBag, Gavel, LogOut, CreditCard, MapPin, Phone, Mail, Shield, AlertTriangle, Ban, Zap } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../../auth/context/AuthContext.tsx";
import { useIssueBillingKey } from "@/app/payment/hooks/useIssueBillingKey";

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

  async function handleRegisterCard() {
    if (!user) return;
    try {
      await issueBillingKey({
        fullName: user.nickname,
        email: user.email,
        phoneNumber: user.phone,
      });
      toast.success("카드가 등록되었습니다.");
      await refreshUser();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "카드 등록에 실패했습니다.");
    }
  }

  const tabs = [
    { id: "info",     label: "내 정보",   icon: <User className="w-4 h-4" />         },
    { id: "buying",   label: "구매 내역", icon: <ShoppingBag className="w-4 h-4" />  },
    { id: "bids",     label: "입찰 내역", icon: <Gavel className="w-4 h-4" />        },
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
            <div className="flex gap-2 mt-6">
              <Link
                to="/my-auctions"
                className="flex items-center gap-1.5 bg-[#CC0000] hover:bg-[#aa0000] text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
              >
                <Zap className="w-3.5 h-3.5" /> 내 경매
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoCard icon={<Mail className="w-4 h-4 text-[#FFCB05]" />}   label="이메일"   value={user.email} />
                  <InfoCard icon={<User className="w-4 h-4 text-[#FFCB05]" />}   label="닉네임"   value={user.nickname} />
                  <InfoCard icon={<Phone className="w-4 h-4 text-[#FFCB05]" />}  label="휴대폰"   value={user.phone} />
                  <InfoCard icon={<MapPin className="w-4 h-4 text-[#FFCB05]" />} label="주소"     value={user.address ?? "미등록"} />
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
              <EmptyTab emoji="🛍️" title="구매 내역이 없습니다" desc="낙찰된 경매가 생기면 여기에 표시됩니다." />
            )}

            {/* ── 입찰 내역 ──────────────────────────────────────────────── */}
            {activeTab === "bids" && (
              <EmptyTab emoji="⚡" title="입찰 내역이 없습니다" desc="경매에 입찰하면 여기에 기록됩니다." />
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

function StatusBadge({ label, variant }: { label: string; variant: "ok" | "warn" | "danger" | "admin" }) {
  const cls = {
    ok:     "bg-green-500/10 text-green-500 border-green-500/20",
    warn:   "bg-amber-500/10 text-amber-500 border-amber-500/20",
    danger: "bg-red-500/10 text-red-500 border-red-500/20",
    admin:  "bg-[#CC0000]/10 text-[#CC0000] border-[#CC0000]/20",
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
