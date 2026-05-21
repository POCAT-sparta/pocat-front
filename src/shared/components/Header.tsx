import { Link, useLocation, useNavigate } from "react-router";
import { Search, User, Menu, LogIn } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/app/auth/context/AuthContext";
import { toast } from "sonner";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { path: "/", label: "홈" },
    { path: "/marketplace", label: "마켓" },
    { path: "/auctions", label: "경매" },
    { path: "/flash-sale", label: "특별 이벤트" },
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg">
                <span className="font-bold">TCG MARKET</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm transition-colors hover:text-primary ${
                    location.pathname === item.path
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-muted rounded-lg px-4 py-2 gap-2 w-64">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="카드명, 세트명 검색"
                className="bg-transparent border-none outline-none w-full text-sm"
              />
            </div>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.nickname}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-muted-foreground"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors"
                >
                  회원가입
                </Link>
              </div>
            )}

            <button
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex items-center bg-muted rounded-lg px-4 py-2 gap-2 mb-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="카드명, 세트명 검색"
                className="bg-transparent border-none outline-none w-full text-sm"
              />
            </div>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t pt-2 mt-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm hover:bg-muted"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      {user?.nickname}
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 rounded-lg text-sm hover:bg-muted"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      로그인
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-4 py-2 rounded-lg text-sm hover:bg-muted"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      회원가입
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
