/**
 * 서버 시간 처리 유틸.
 *
 * 백엔드는 모든 시간 필드를 java.time.LocalDateTime 으로 직렬화한다.
 * → "2026-06-15T12:00:00" 처럼 타임존 표기가 없다.
 * 그런데 실제 서버 JVM 타임존이 UTC 라서, 표기 없는 값은 *UTC 벽시계*다.
 * (예: startedAt/endedAt 카운트다운이 정확히 9시간씩 어긋나던 원인)
 *
 * JS `new Date("2026-06-15T12:00:00")` 는 이 문자열을 *브라우저 로컬* 시각으로
 * 해석하므로 환경마다 절대시각·카운트다운이 어긋난다.
 * 따라서 타임존 표기가 없으면 UTC(Z)로 간주해 파싱하고, 표시는 항상
 * Asia/Seoul 로 강제한다.
 */

export const KST_TIME_ZONE = "Asia/Seoul";

/** 타임존 표기(Z 또는 ±hh:mm)가 이미 있는지 */
function hasTimeZone(iso: string): boolean {
  return /([zZ]|[+-]\d{2}:?\d{2})$/.test(iso.trim());
}

/**
 * 서버가 준 시간 문자열을 절대시각 Date 로 변환한다.
 * 타임존 표기가 없으면 UTC(Z)로 간주한다.
 */
export function parseServerDate(iso: string | null | undefined): Date {
  if (!iso) return new Date(NaN);
  return new Date(hasTimeZone(iso) ? iso : `${iso}Z`);
}

/** 서버 시간 문자열 → epoch ms (카운트다운/비교용) */
export function serverTime(iso: string | null | undefined): number {
  return parseServerDate(iso).getTime();
}

/** Asia/Seoul 기준으로 포맷 (ko-KR) */
export function formatKST(
  iso: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const d = parseServerDate(iso);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("ko-KR", { timeZone: KST_TIME_ZONE, ...options });
}
