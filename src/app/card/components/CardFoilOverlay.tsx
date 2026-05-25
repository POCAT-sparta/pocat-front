import { useEffect, useRef, useState } from "react";
import type { CardGrade } from "@/types/card.types";

interface CardFoilOverlayProps {
  mouse: { x: number; y: number };
  isHovered: boolean;
  grade: CardGrade;
}

const FOIL_CONFIG: Partial<Record<CardGrade, { foil: string; mask: string; idle: number; hover: number }>> = {
  BGS_10: {
    foil: "https://poke-holo.b-cdn.net/foils/swsh1/foils/upscaled/173_foil_holo_reverse_2x.webp",
    mask: "https://poke-holo.b-cdn.net/foils/swsh1/masks/upscaled/173_foil_holo_reverse_2x.webp",
    idle: 0,
    hover: 0.2,
  },
};

export function CardFoilOverlay({ mouse, isHovered, grade }: CardFoilOverlayProps) {
  const foil = FOIL_CONFIG[grade];
  const prevRef = useRef(mouse);
  const [dist, setDist] = useState(0);

  useEffect(() => {
    const dx = mouse.x - prevRef.current.x;
    const dy = mouse.y - prevRef.current.y;
    prevRef.current = mouse;
    const moved = Math.sqrt(dx * dx + dy * dy);
    if (moved > 0) setDist((d) => d + moved);
  }, [mouse]);

  if (!foil) return null;

  // 마우스 이동 거리에 따라 0~1 사이를 진동
  const phase = (Math.sin(dist * 5) + 1) / 2;
  const bgPos = `${50 + (mouse.x - 0.5) * 15}% ${50 + (mouse.y - 0.5) * 15}%`;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: isHovered ? foil.hover : foil.idle,
        transition: "opacity 0.3s ease-out",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${foil.foil}")`,
          backgroundSize: "cover",
          backgroundPosition: bgPos,
          mixBlendMode: "screen",
          opacity: phase,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${foil.mask}")`,
          backgroundSize: "cover",
          backgroundPosition: bgPos,
          mixBlendMode: "screen",
          opacity: 1 - phase,
        }}
      />
    </div>
  );
}
