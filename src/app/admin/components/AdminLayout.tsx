import { Link, NavLink, Outlet } from "react-router";
import { Users, FileCheck, Layers, Gavel } from "lucide-react";

const NAV = [
  { to: "/admin/users",    label: "회원 관리",   icon: Users     },
  { to: "/admin/cards",    label: "카드 요청",   icon: FileCheck },
  { to: "/admin/catalog",  label: "카탈로그",    icon: Layers    },
  { to: "/admin/auctions", label: "경매 관리",   icon: Gavel     },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-[#0f0f1a] text-white">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="w-60 shrink-0 bg-[#1a1a2e] border-r border-white/10 flex flex-col">
        <Link to="/" className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
          <span className="font-extrabold text-[#FFCB05] text-lg tracking-tight">POCAT</span>
          <span className="text-[10px] text-white/40 tracking-widest uppercase">Admin</span>
        </Link>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#FFCB05] text-[#1a1a2e]"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/"
          className="m-3 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white hover:bg-white/10 transition-colors text-center"
        >
          ← 서비스로 돌아가기
        </Link>
      </aside>

      {/* ── Content ─────────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-8 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
