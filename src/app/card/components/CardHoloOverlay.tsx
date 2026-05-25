import type { CardGrade } from "@/types/card.types";

interface CardHoloOverlayProps {
  grade: CardGrade;
  isHovered: boolean;
  mouse: { x: number; y: number };
}

const HOLO_GRADES = new Set<CardGrade>(["PSA_10"]);

export function CardHoloOverlay({ grade, isHovered, mouse }: CardHoloOverlayProps) {
  if (!HOLO_GRADES.has(grade)) return null;

  const stripes = [
    { speed: 25, offset: 15 },
    { speed: 18, offset: 55 },
  ];

  return (
    <>
      {stripes.map(({ speed, offset }, i) => {
        const pos = ((mouse.x + mouse.y) * speed + offset).toFixed(1);
        return (
          <div
            key={i}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, blue, violet)",
              WebkitMaskImage: "linear-gradient(120deg, transparent 44%, white 50%, transparent 56%)",
              maskImage: "linear-gradient(120deg, transparent 44%, white 50%, transparent 56%)",
              WebkitMaskSize: "300% 300%",
              maskSize: "300% 300%",
              WebkitMaskPosition: `${pos}% ${pos}%`,
              maskPosition: `${pos}% ${pos}%`,
              mixBlendMode: "color-dodge",
              opacity: isHovered ? 0.6 : 0,
              transition: "opacity 0.3s ease-out",
              filter: "brightness(2)",
            }}
          />
        );
      })}
    </>
  );
}
