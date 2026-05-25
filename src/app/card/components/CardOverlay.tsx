import type { CardGrade } from "@/types/card.types";
import { CardFoilOverlay } from "./CardFoilOverlay";
import { CardHoloOverlay } from "./CardHoloOverlay";
import { CardShineOverlay } from "./CardShineOverlay";

interface CardOverlayProps {
  imageUrl: string;
  mouse: { x: number; y: number };
  isHovered: boolean;
  grade?: CardGrade;
}

export function CardOverlay({ imageUrl, mouse, isHovered, grade }: CardOverlayProps) {
  return (
    <>
      {grade && <CardFoilOverlay mouse={mouse} isHovered={isHovered} grade={grade} />}
      {grade && <CardHoloOverlay mouse={mouse} isHovered={isHovered} grade={grade} />}
      <CardShineOverlay mouse={mouse} isHovered={isHovered} />
    </>
  );
}
