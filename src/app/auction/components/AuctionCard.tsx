import { Link } from "react-router";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import type { AuctionListItem } from "@/types/auction.types";
import { serverTime } from "@/shared/lib/datetime";

interface AuctionCardProps {
  auction: AuctionListItem;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const distance = serverTime(auction.endedAt) - Date.now();

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
  }, [auction.endedAt]);

  return (
    <Link to={`/auctions/${auction.auctionId}`} className="group">
      <div className="bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-all">
        <div className="aspect-[3/4] bg-muted relative overflow-hidden">
          {auction.cardImageUrl ? (
            <img
              src={auction.cardImageUrl}
              alt={auction.cardName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              이미지 없음
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
              {auction.grade}
            </span>
          </div>
          <div className="absolute top-2 right-2">
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              경매중
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs text-muted-foreground mb-1">{auction.cardName}</div>
          <h3 className="font-medium mb-3 line-clamp-2 min-h-[2.5rem] text-sm">{auction.title}</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">현재 입찰가</span>
              <span className="font-bold text-red-500 text-sm">
                {(auction.highestPrice ?? auction.startingPrice).toLocaleString()}원
              </span>
            </div>

            {auction.buyoutPrice > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">즉시 구매가</span>
                <span className="text-xs text-muted-foreground">
                  {auction.buyoutPrice.toLocaleString()}원
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">{timeLeft}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
