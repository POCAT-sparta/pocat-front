interface CardShineOverlayProps {
  mouse: { x: number; y: number };
  isHovered: boolean;
}

export function CardShineOverlay({ mouse, isHovered }: CardShineOverlayProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(circle at ${mouse.x * 100}% ${mouse.y * 100}%, rgba(255,255,255,1) 0%, transparent 75%)`,
        opacity: isHovered ? 1 : 0,
        transition: "opacity 0.2s ease-out",
        mixBlendMode: "overlay",
      }}
    />
  );
}
