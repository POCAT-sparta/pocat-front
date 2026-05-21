import { User, Package, ShoppingBag, Gavel, Heart, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../../auth/context/AuthContext.tsx";

export function Profile() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");

  const tabs = [
    { id: "info", label: "내 정보", icon: User },
    { id: "buying", label: "구매 내역", icon: ShoppingBag },
    { id: "selling", label: "판매 내역", icon: Package },
    { id: "bids", label: "입찰 내역", icon: Gavel },
    { id: "wishlist", label: "관심 상품", icon: Heart },
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
        <div className="text-muted-foreground">불러오는 중...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
          <p className="text-muted-foreground mb-6">프로필을 보려면 로그인해주세요.</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl mb-1">{user.nickname}</h1>
                <p className="opacity-90 text-sm">{user.email}</p>
                <div className="flex items-center gap-3 mt-2 text-sm opacity-80">
                  <span>역할: {user.role === "ADMIN" ? "관리자" : "일반 회원"}</span>
                  {user.isBidBlocked && (
                    <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs">
                      입찰 차단
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-card border rounded-lg">
          <div className="border-b">
            <div className="flex items-center overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
              <button className="ml-auto px-6 py-4 text-muted-foreground hover:text-foreground">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "info" && (
              <div className="max-w-lg space-y-4">
                <h2 className="mb-4">내 정보</h2>
                <InfoRow label="이메일" value={user.email} />
                <InfoRow label="닉네임" value={user.nickname} />
                <InfoRow label="휴대폰" value={user.phone} />
                <InfoRow label="주소" value={user.address ?? "미등록"} />
                <InfoRow label="계좌" value={user.bankAccount ? `${user.bankName} ${user.bankAccount}` : "미등록"} />
                <InfoRow label="빌링키" value={user.hasBillingKey ? "등록됨" : "미등록"} />
                <InfoRow label="미결제 패널티" value={`${user.unpaidStrike}회`} />
                <InfoRow label="가입일" value={user.createdAt.slice(0, 10)} />
              </div>
            )}

            {activeTab === "buying" && (
              <div>
                <h2 className="mb-6">구매 내역</h2>
                <div className="text-center py-12 text-muted-foreground">
                  구매 내역이 없습니다
                </div>
              </div>
            )}

            {activeTab === "selling" && (
              <div>
                <h2 className="mb-6">판매 내역</h2>
                <div className="text-center py-12 text-muted-foreground">
                  판매 내역이 없습니다
                </div>
              </div>
            )}

            {activeTab === "bids" && (
              <div>
                <h2 className="mb-6">입찰 내역</h2>
                <div className="text-center py-12 text-muted-foreground">
                  입찰 내역이 없습니다
                </div>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div>
                <h2 className="mb-6">관심 상품</h2>
                <div className="text-center py-12 text-muted-foreground">
                  관심 상품이 없습니다
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center py-3 border-b last:border-b-0">
      <span className="text-muted-foreground text-sm w-28 shrink-0">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
