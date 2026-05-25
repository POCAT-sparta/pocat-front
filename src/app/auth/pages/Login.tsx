import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext.tsx";
import type { LoginRequest } from "@/types/auth.types";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>();

  async function onSubmit(data: LoginRequest) {
    try {
      await login(data);
      toast.success("로그인 성공");
      navigate("/");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "로그인에 실패했습니다.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg inline-block mb-4">
              <span className="font-bold text-lg">TCG MARKET</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold">로그인</h1>
          <p className="text-muted-foreground mt-2">계정에 로그인하세요</p>
        </div>

        <div className="bg-card border rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">이메일</label>
              <input
                type="email"
                placeholder="user@example.com"
                className="w-full border rounded-lg px-3 py-2 bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                {...register("email", {
                  required: "이메일을 입력해주세요",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "올바른 이메일 형식이 아닙니다",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">비밀번호</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border rounded-lg px-3 py-2 bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                {...register("password", { required: "비밀번호를 입력해주세요" })}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            아직 계정이 없으신가요?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
