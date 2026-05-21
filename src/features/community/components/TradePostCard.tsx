import { Link } from "react-router";
import { Eye } from "lucide-react";
import type { TradePostListItem } from "../types/post.types";

interface TradePostCardProps {
  post: TradePostListItem;
}

export function TradePostCard({ post }: TradePostCardProps) {
  return (
    <Link to={`/product/${post.id}`} className="group">
      <div className="bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-all">
        <div className="aspect-[3/4] bg-muted relative overflow-hidden">
          {post.thumbnail ? (
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              이미지 없음
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="text-xs text-muted-foreground mb-1">{post.authorNickname}</div>
          <h3 className="font-medium mb-3 line-clamp-2 min-h-[2.5rem] text-sm">{post.title}</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">판매가</span>
              <span className="font-bold">{post.price.toLocaleString()}원</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1 border-t">
              <Eye className="w-3 h-3" />
              <span>{post.viewCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
