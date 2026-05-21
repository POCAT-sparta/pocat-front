import { Link } from "react-router";
import { Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface AuctionCardProps {
  id: string;
  name: string;
  image: string;
  currentBid: number;
  bidCount: number;
  endsAt: Date;
  rarity: string;
  set: string;
}

export function AuctionCard({
  id,
  name,
  image,
  currentBid,
  bidCount,
  endsAt,
  rarity,
  set,
}: AuctionCardProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(endsAt).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft("종료");
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}시간 ${minutes}분 ${seconds}초`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <Link to={`/product/${id}`} className="group">
      <div className="bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-all">
        <div className="aspect-[3/4] bg-muted relative overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
              {rarity}
            </span>
          </div>
          <div className="absolute top-2 right-2">
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              경매중
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs text-muted-foreground mb-1">{set}</div>
          <h3 className="font-medium mb-3 line-clamp-2 min-h-[2.5rem]">{name}</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">현재 입찰가</span>
              <span className="font-bold text-red-500">
                {currentBid.toLocaleString()}원
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" />
                <span className="text-xs">{bidCount}명 입찰</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{timeLeft}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
