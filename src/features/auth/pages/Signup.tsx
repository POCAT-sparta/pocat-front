import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import type { SignupRequest } from "../types/auth.types";

export function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupRequest>();

  async function onSubmit(data: SignupRequest) {
    try {
      await signup(data);
      toast.success("회원가입 성공! 로그인해주세요.");
      navigate("/login");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "회원가입에 실패했습니다.");
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
          <h1 className="text-2xl font-bold">회원가입</h1>
          <p className="text-muted-foreground mt-2">새 계정을 만들어보세요</p>
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
                placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                className="w-full border rounded-lg px-3 py-2 bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                {...register("password", {
                  required: "비밀번호를 입력해주세요",
                  minLength: { value: 8, message: "비밀번호는 8자 이상이어야 합니다" },
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">닉네임</label>
              <input
                type="text"
                placeholder="포켓몬마스터"
                className="w-full border rounded-lg px-3 py-2 bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                {...register("nickname", {
                  required: "닉네임을 입력해주세요",
                  minLength: { value: 2, message: "닉네임은 2자 이상이어야 합니다" },
                })}
              />
              {errors.nickname && (
                <p className="text-red-500 text-xs mt-1">{errors.nickname.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">휴대폰 번호</label>
              <input
                type="tel"
                placeholder="010-1234-5678"
                className="w-full border rounded-lg px-3 py-2 bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                {...register("phone", {
                  required: "휴대폰 번호를 입력해주세요",
                  pattern: {
                    value: /^010-\d{4}-\d{4}$/,
                    message: "010-0000-0000 형식으로 입력해주세요",
                  },
                })}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "가입 중..." : "회원가입"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            이미 계정이 있으신가요?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
