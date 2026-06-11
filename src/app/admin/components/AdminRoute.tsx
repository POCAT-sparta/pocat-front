import { Navigate, Outlet } from "react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/app/auth/context/AuthContext";

/**
 * 관리자 전용 라우트 가드.
 * - 쿠키 토큰으로 유저 복원이 끝날 때까지(isLoading) 판단을 미룬다.
 *   (안 그러면 새로고침 직후 잠깐 비로그인으로 오인해 튕긴다)
 * - 비로그인 → /login, 일반 유저 → / 로 리다이렉트.
 * - 실제 보안은 서버의 ADMIN 권한 검사가 책임지며, 이 가드는 UX용이다.
 */
export function AdminRoute() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <Loader2 className="w-8 h-8 text-[#FFCB05] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
