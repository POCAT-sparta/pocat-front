import { useRef, useState } from "react";
import type { CardGrade } from "@/types/card.types";
import { CardOverlay } from "./CardOverlay";

interface CardItemProps {
  imageUrl: string;
  name?: string;
  className?: string;
  grade?: CardGrade;
}

export function CardItem({ imageUrl, name, className, grade }: CardItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current!.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
    if (!isHovered) setIsHovered(true);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    setMouse({ x: 0.5, y: 0.5 });
  }

  const rotateX = -(mouse.y - 0.5) * 22;
  const rotateY = (mouse.x - 0.5) * 22;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: isHovered ? "transform 0.08s ease-out" : "transform 0.5s ease-out",
      }}
      className={`relative rounded-xl overflow-hidden shadow-xl border bg-card ${className ?? "w-48"}`}
    >
      <div className="aspect-[2/3]">
        <img src={imageUrl} alt={name ?? "카드"} className="w-full h-full object-cover" />
      </div>

      <CardOverlay imageUrl={imageUrl} mouse={mouse} isHovered={isHovered} grade={grade} />
    </div>
  );
}
