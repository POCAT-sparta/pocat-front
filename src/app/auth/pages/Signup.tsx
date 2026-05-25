import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext.tsx";
import type { SignupRequest } from "@/types/auth.types";

const POKEBALL_SVG = (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="4" />
    <path d="M2 50 Q2 2 50 2 Q98 2 98 50" fill="#CC0000" />
    <path d="M2 50 Q2 98 50 98 Q98 98 98 50" fill="white" />
    <rect x="2" y="46" width="96" height="8" fill="#1a1a2e" />
    <circle cx="50" cy="50" r="14" fill="#1a1a2e" />
    <circle cx="50" cy="50" r="9" fill="white" />
    <circle cx="46" cy="46" r="3" fill="white" opacity="0.6" />
  </svg>
);

export function Signup() {
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupRequest>();

  async function onSubmit(data: SignupRequest) {
    try {
      await signup(data);
      toast.success("🎉 트레이너 등록 완료! 로그인해주세요.");
      navigate("/login");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "회원가입에 실패했습니다.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border-[40px] border-white/[0.03]" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border-[30px] border-white/[0.03]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-full bg-[#CC0000] flex items-center justify-center shadow-lg shadow-red-900/40 group-hover:scale-110 transition-transform">
              {POKEBALL_SVG}
            </div>
            <div>
              <p className="text-[#FFCB05] font-extrabold text-2xl tracking-tight leading-none">POCAT</p>
              <p className="text-white/30 text-[10px] tracking-widest uppercase">Pokémon Auction</p>
            </div>
          </Link>

          <h1 className="text-xl font-bold text-white mt-5">트레이너 등록</h1>
          <p className="text-white/40 text-sm mt-1">포켓몬 카드 경매의 여정을 시작하세요</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-7 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">
                이메일
              </label>
              <input
                type="email"
                placeholder="trainer@pocat.gg"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FFCB05]/50 transition-colors"
                {...register("email", {
                  required: "이메일을 입력해주세요",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "올바른 이메일 형식이 아닙니다" },
                })}
              />
              {errors.email && <p className="text-[#CC0000] text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">
                비밀번호
              </label>
              <input
                type="password"
                placeholder="영문·숫자·특수문자 포함 8자 이상"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FFCB05]/50 transition-colors"
                {...register("password", {
                  required: "비밀번호를 입력해주세요",
                  minLength: { value: 8, message: "비밀번호는 8자 이상이어야 합니다" },
                })}
              />
              {errors.password && <p className="text-[#CC0000] text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">
                트레이너 닉네임
              </label>
              <input
                type="text"
                placeholder="포켓몬마스터"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FFCB05]/50 transition-colors"
                {...register("nickname", {
                  required: "닉네임을 입력해주세요",
                  minLength: { value: 2, message: "닉네임은 2자 이상이어야 합니다" },
                })}
              />
              {errors.nickname && <p className="text-[#CC0000] text-xs mt-1.5">{errors.nickname.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">
                휴대폰 번호
              </label>
              <input
                type="tel"
                placeholder="010-1234-5678"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FFCB05]/50 transition-colors"
                {...register("phone", {
                  required: "휴대폰 번호를 입력해주세요",
                  pattern: { value: /^010-\d{4}-\d{4}$/, message: "010-0000-0000 형식으로 입력해주세요" },
                })}
              />
              {errors.phone && <p className="text-[#CC0000] text-xs mt-1.5">{errors.phone.message}</p>}
            </div>

            <div className="bg-[#FFCB05]/5 border border-[#FFCB05]/15 rounded-xl px-4 py-3 text-[11px] text-white/50 leading-relaxed">
              ⚡ 가입 시 POCAT 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#CC0000] hover:bg-[#aa0000] text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/30"
            >
              {isSubmitting ? "가입 중..." : "💰 트레이너 등록하기"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/10 text-center">
            <p className="text-sm text-white/40">
              이미 트레이너이신가요?{" "}
              <Link to="/login" className="text-[#FFCB05] hover:text-yellow-300 font-semibold transition-colors">
                로그인
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/20 text-[10px] mt-6">
          © POCAT — 포켓몬 카드 경매 플랫폼
        </p>
      </div>
    </div>
  );
}
