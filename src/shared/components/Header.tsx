import { Link, useLocation, useNavigate } from "react-router";
import { Menu, User, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/app/auth/context/AuthContext";
import { toast } from "sonner";

const POKEBALL_SVG = (
  <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="4" />
    <path d="M2 50 Q2 2 50 2 Q98 2 98 50" fill="#CC0000" />
    <path d="M2 50 Q2 98 50 98 Q98 98 98 50" fill="white" />
    <rect x="2" y="46" width="96" height="8" fill="#1a1a2e" />
    <circle cx="50" cy="50" r="14" fill="#1a1a2e" />
    <circle cx="50" cy="50" r="9" fill="white" />
    <circle cx="46" cy="46" r="3" fill="white" opacity="0.6" />
  </svg>
);

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { path: "/",        label: "🏠 경매장"    },
    { path: "/free",    label: "💬 자유게시판" },
    { path: "/trade",   label: "🎴 거래게시판" },
    { path: "/profile", label: "⚡ 내 경매"   },
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
    <header className="sticky top-0 z-50 w-full bg-[#1a1a2e] border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* ── Logo ────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            {POKEBALL_SVG}
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-[#FFCB05] text-lg tracking-tight">POCAT</span>
              <span className="text-[10px] text-white/50 tracking-widest uppercase">Pokémon Auction</span>
            </div>
          </Link>

          {/* ── Desktop nav ─────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#FFCB05] text-[#1a1a2e]"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop auth ────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm text-white"
                >
                  <div className="w-6 h-6 rounded-full bg-[#FFCB05] flex items-center justify-center text-[#1a1a2e] font-bold text-xs">
                    {user?.nickname?.[0]?.toUpperCase() ?? "T"}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.nickname}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-[#CC0000] hover:bg-[#aa0000] text-white transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ────────────────────────────── */}
          <button
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* ── Mobile menu ─────────────────────────────────────── */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#FFCB05] text-[#1a1a2e]"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="border-t border-white/10 pt-3 mt-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/80 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#FFCB05] flex items-center justify-center text-[#1a1a2e] font-bold text-xs">
                      {user?.nickname?.[0]?.toUpperCase() ?? "T"}
                    </div>
                    <span>{user?.nickname} 트레이너</span>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#CC0000] hover:bg-[#aa0000] text-white text-center transition-colors"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
