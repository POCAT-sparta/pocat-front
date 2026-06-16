
# 경매 상세 → 카드 상세 이동 링크

**Date:** 2026-06-16
**Status:** Approved

---

## 요약

경매 상세 페이지(`AuctionDetail.tsx`)에서 카드 이미지를 클릭하면 해당 카드의 상세 페이지(`/cards/:cardId`)로
이동한다. `AuctionDetail` 타입에 이미 `cardId`가 포함되어 있어 타입/백엔드 변경은 필요 없다.

## 변경 내용

`AuctionDetail.tsx`의 카드 이미지 영역 — `CardItem`이 보이는 분기와 이미지 없을 때의 placeholder("💰") 분기
둘 다 `<Link to={`/cards/${auction.cardId}`}>`로 감싼다.

- 이미지 유무와 무관하게 동일 카드이므로 두 분기 모두 클릭 가능하게 처리
- `cursor-pointer` + 가벼운 hover 강조(ring/그림자)로 클릭 가능함을 시각적으로 표시 — `CardItem`의 기존
  3D tilt 효과를 가리지 않는 수준으로
- `aria-label="카드 상세 보기"` 부여

## 미변경 범위

- `AuctionDetail` 타입, `auctionApi.ts`: 변경 없음 (`cardId` 이미 존재)
- 백엔드: 변경 없음
