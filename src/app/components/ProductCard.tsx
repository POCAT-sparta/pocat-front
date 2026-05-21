import { Link } from "react-router";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  instantBuyPrice?: number;
  lastSalePrice?: number;
  priceChange?: number;
  rarity: string;
  set: string;
}

export function ProductCard({
  id,
  name,
  image,
  price,
  instantBuyPrice,
  lastSalePrice,
  priceChange,
  rarity,
  set,
}: ProductCardProps) {
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
        </div>

        <div className="p-4">
          <div className="text-xs text-muted-foreground mb-1">{set}</div>
          <h3 className="font-medium mb-3 line-clamp-2 min-h-[2.5rem]">{name}</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">즉시 구매가</span>
              <span className="font-bold">{price.toLocaleString()}원</span>
            </div>

            {instantBuyPrice && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-xs text-muted-foreground">즉시 판매가</span>
                <span className="text-muted-foreground">
                  {instantBuyPrice.toLocaleString()}원
                </span>
              </div>
            )}

            {lastSalePrice && priceChange !== undefined && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">최근 거래가</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs">
                    {lastSalePrice.toLocaleString()}원
                  </span>
                  {priceChange !== 0 && (
                    <span
                      className={`flex items-center text-xs ${
                        priceChange > 0 ? "text-red-500" : "text-blue-500"
                      }`}
                    >
                      {priceChange > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(priceChange)}%
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
