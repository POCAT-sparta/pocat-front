import { Link, Outlet } from "react-router";
import { Header } from "../../shared/components/Header";

function Footer() {
  return (
    <footer className="bg-[#1a1a2e] border-t border-white/10 text-white mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="4" />
                <path d="M2 50 Q2 2 50 2 Q98 2 98 50" fill="#CC0000" />
                <path d="M2 50 Q2 98 50 98 Q98 98 98 50" fill="white" />
                <rect x="2" y="46" width="96" height="8" fill="#1a1a2e" />
                <circle cx="50" cy="50" r="14" fill="#1a1a2e" />
                <circle cx="50" cy="50" r="9" fill="white" />
              </svg>
              <span className="font-extrabold text-[#FFCB05] text-xl tracking-tight">POCAT</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              포켓몬 트레이딩 카드의<br />실시간 경매 플랫폼
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[#FFCB05] font-semibold text-sm mb-4 tracking-wide uppercase">바로가기</h4>
            <ul className="space-y-2.5 text-sm text-white/50">
              <li>
                <Link to="/" className="hover:text-[#FFCB05] transition-colors">🏠 경매장</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#FFCB05] transition-colors">⚡ 내 경매</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#FFCB05] transition-colors">🔑 로그인</Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-[#FFCB05] transition-colors">🎮 회원가입</Link>
              </li>
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h4 className="text-[#FFCB05] font-semibold text-sm mb-4 tracking-wide uppercase">안내</h4>
            <ul className="space-y-2.5 text-sm text-white/50">
              <li className="hover:text-white/70 transition-colors cursor-default">📋 이용약관</li>
              <li className="hover:text-white/70 transition-colors cursor-default">🔒 개인정보처리방침</li>
              <li className="hover:text-white/70 transition-colors cursor-default">✅ 검수 기준</li>
              <li className="hover:text-white/70 transition-colors cursor-default">❓ 자주 묻는 질문</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            © 2026 POCAT. All rights reserved.
          </p>
          <p className="text-xs text-white/20">
            Pokémon and all related names are trademarks of Nintendo / Game Freak.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function Root() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
