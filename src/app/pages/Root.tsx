import { Outlet } from "react-router";
import { Header } from "../../shared/components/Header";

export function Root() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="mb-4">TCG MARKET</h4>
              <p className="text-sm text-muted-foreground">
                포켓몬 카드 및 TCG 전문 거래 플랫폼
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm">이용안내</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>검수 기준</li>
                <li>이용 정책</li>
                <li>패널티 정책</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm">고객지원</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>공지사항</li>
                <li>FAQ</li>
                <li>1:1 문의</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm">소셜미디어</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Instagram</li>
                <li>Twitter</li>
                <li>Discord</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2026 TCG MARKET. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
