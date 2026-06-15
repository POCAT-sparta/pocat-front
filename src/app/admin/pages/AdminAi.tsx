import { useState } from "react";
import type { ReactNode } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { reindexAi, esAliasSetup, esMigrate, esMigrateCards, esMigrateAuctions, migrateCardImages } from "@/api/admin";
import { AdminPageHeader } from "../components/AdminUI";

/** 운영 액션 카드 (비동기/장시간 작업 단일 버튼) */
function OpsCard({
  title,
  description,
  buttonLabel,
  running,
  onRun,
}: {
  title: string;
  description: ReactNode;
  buttonLabel: string;
  running: boolean;
  onRun: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a1a2e] p-6">
      <h2 className="text-white font-semibold mb-1">{title}</h2>
      <p className="text-sm text-white/50 leading-relaxed mb-5">{description}</p>
      <button
        onClick={onRun}
        disabled={running}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#FFCB05] text-[#1a1a2e] hover:brightness-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {running
          ? <><Loader2 className="w-4 h-4 animate-spin" /> 실행 중...</>
          : <><RefreshCw className="w-4 h-4" /> {buttonLabel}</>}
      </button>
    </div>
  );
}

/**
 * 운영. 조회 화면 없이 백그라운드/유지보수 액션만 모아둔다.
 * - 재색인(AI 벡터 스토어): 비동기 202
 * - DB→ES 마이그레이션: 동기, 완료 후 건수 반환
 * - 카드 이미지 S3 마이그레이션: 비동기 202
 */
export function AdminAi() {
  const [running, setRunning] = useState<string | null>(null);

  async function handleReindex() {
    if (!window.confirm("활성 카드 전체를 벡터 스토어에 재색인합니다.\n시간이 걸릴 수 있으며 백그라운드에서 실행됩니다. 진행할까요?")) return;
    setRunning("reindex");
    try {
      await reindexAi();
      toast.success("재색인 요청이 접수되었습니다. 백그라운드에서 처리됩니다.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "재색인 요청에 실패했습니다.");
    } finally {
      setRunning(null);
    }
  }

  async function handleEsAliasSetup() {
    if (!window.confirm("ES 인덱스 별칭을 초기 설정합니다.\n최초 구동 시 인덱스/별칭을 생성하는 1회성 작업입니다. 진행할까요?")) return;
    setRunning("es-alias-setup");
    try {
      await esAliasSetup();
      toast.success("ES 인덱스 별칭 초기 설정이 완료되었습니다.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ES 인덱스 별칭 초기 설정에 실패했습니다.");
    } finally {
      setRunning(null);
    }
  }

  async function handleEsMigrate() {
    if (!window.confirm("DB의 카드/경매를 Elasticsearch로 일괄 인덱싱합니다.\n동기로 실행되어 완료까지 시간이 걸릴 수 있습니다. 진행할까요?")) return;
    setRunning("es-migrate");
    try {
      const res = await esMigrate();
      toast.success(`마이그레이션 완료 — 카드 ${res.cardsMigrated}건, 경매 ${res.auctionsMigrated}건`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "마이그레이션에 실패했습니다.");
    } finally {
      setRunning(null);
    }
  }

  async function handleEsMigrateCards() {
    if (!window.confirm("DB의 카드만 Elasticsearch로 일괄 인덱싱합니다.\n동기로 실행되어 완료까지 시간이 걸릴 수 있습니다. 진행할까요?")) return;
    setRunning("es-migrate-cards");
    try {
      const res = await esMigrateCards();
      toast.success(`카드 마이그레이션 완료 — ${res.cardsMigrated}건`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "카드 마이그레이션에 실패했습니다.");
    } finally {
      setRunning(null);
    }
  }

  async function handleEsMigrateAuctions() {
    if (!window.confirm("DB의 경매만 Elasticsearch로 일괄 인덱싱합니다.\n동기로 실행되어 완료까지 시간이 걸릴 수 있습니다. 진행할까요?")) return;
    setRunning("es-migrate-auctions");
    try {
      const res = await esMigrateAuctions();
      toast.success(`경매 마이그레이션 완료 — ${res.auctionsMigrated}건`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "경매 마이그레이션에 실패했습니다.");
    } finally {
      setRunning(null);
    }
  }

  async function handleMigrateImages() {
    if (!window.confirm("TCGdex 카드 이미지를 S3로 마이그레이션합니다.\n시간이 걸릴 수 있으며 백그라운드에서 실행됩니다. 진행할까요?")) return;
    setRunning("migrate-images");
    try {
      await migrateCardImages();
      toast.success("이미지 마이그레이션 요청이 접수되었습니다. 백그라운드에서 처리됩니다.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "이미지 마이그레이션 요청에 실패했습니다.");
    } finally {
      setRunning(null);
    }
  }

  return (
    <div>
      <AdminPageHeader title="운영" />

      <div className="grid gap-4 sm:grid-cols-2 max-w-4xl">
        <OpsCard
          title="벡터 스토어 재색인"
          description="활성 상태의 모든 카드를 AI 검색용 벡터 스토어에 다시 색인합니다. 카드 데이터를 대량으로 동기화했거나 검색 결과가 누락될 때 실행하세요. 비동기로 처리되며 요청 즉시 접수만 확인됩니다."
          buttonLabel="전체 재색인 실행"
          running={running === "reindex"}
          onRun={handleReindex}
        />
        <OpsCard
          title="ES 인덱스 별칭 초기 설정"
          description="Elasticsearch 인덱스와 별칭(alias)을 생성하는 1회성 초기 설정입니다. 마이그레이션 전 최초 구동 시 가장 먼저 실행하세요. 이미 설정된 경우 다시 실행할 필요는 없습니다."
          buttonLabel="별칭 초기 설정 실행"
          running={running === "es-alias-setup"}
          onRun={handleEsAliasSetup}
        />
        <OpsCard
          title="DB → ES 마이그레이션"
          description="DB의 카드(ACTIVE)와 경매(ACTIVE/ENDED/유찰)를 Elasticsearch에 일괄 인덱싱합니다. 최초 구동 또는 ES 인덱스 재구성이 필요할 때 실행하세요. 동기로 실행되며 완료 후 건수를 보여줍니다."
          buttonLabel="마이그레이션 실행"
          running={running === "es-migrate"}
          onRun={handleEsMigrate}
        />
        <OpsCard
          title="DB → ES 마이그레이션 (카드만)"
          description="DB의 카드(ACTIVE)만 Elasticsearch에 일괄 인덱싱합니다. 카드 인덱스만 재구성이 필요할 때 실행하세요. 동기로 실행되며 완료 후 건수를 보여줍니다."
          buttonLabel="카드 마이그레이션 실행"
          running={running === "es-migrate-cards"}
          onRun={handleEsMigrateCards}
        />
        <OpsCard
          title="DB → ES 마이그레이션 (경매만)"
          description="DB의 경매(ACTIVE/ENDED/유찰)만 Elasticsearch에 일괄 인덱싱합니다. 경매 인덱스만 재구성이 필요할 때 실행하세요. 동기로 실행되며 완료 후 건수를 보여줍니다."
          buttonLabel="경매 마이그레이션 실행"
          running={running === "es-migrate-auctions"}
          onRun={handleEsMigrateAuctions}
        />
        <OpsCard
          title="카드 이미지 S3 마이그레이션"
          description="TCGdex 외부 카드 이미지를 S3로 옮깁니다. 외부 이미지 의존을 줄이고 로딩을 안정화할 때 실행하세요. 비동기로 처리되며 요청 즉시 접수만 확인됩니다. (완료 여부는 서버 로그로 확인)"
          buttonLabel="이미지 마이그레이션 실행"
          running={running === "migrate-images"}
          onRun={handleMigrateImages}
        />
      </div>
    </div>
  );
}
