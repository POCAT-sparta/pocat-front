import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { AuctionDetail } from "@/app/auction/pages/AuctionDetail";
import { AuctionForm } from "@/app/auction/pages/AuctionForm";
import { MyAuctions } from "@/app/auction/pages/MyAuctions";
import { Profile } from "@/app/user/pages/Profile";
import { Login } from "@/app/auth/pages/Login";
import { Signup } from "@/app/auth/pages/Signup";
import { FreeBoard } from "@/app/community/pages/FreeBoard";
import { FreeBoardDetail } from "@/app/community/pages/FreeBoardDetail";
import { FreeBoardForm } from "@/app/community/pages/FreeBoardForm";
import { TradeBoard } from "@/app/community/pages/TradeBoard";
import { TradeBoardDetail } from "@/app/community/pages/TradeBoardDetail";
import { TradeBoardForm } from "@/app/community/pages/TradeBoardForm";
import { ChatList } from "@/app/chat/pages/ChatList";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },

      // Auction
      { path: "auctions/new",        Component: AuctionForm   },
      { path: "auctions/:auctionId", Component: AuctionDetail },
      { path: "my-auctions",         Component: MyAuctions    },

      // Free board
      { path: "free",            Component: FreeBoard       },
      { path: "free/new",        Component: FreeBoardForm   },
      { path: "free/:id",        Component: FreeBoardDetail },
      { path: "free/:id/edit",   Component: FreeBoardForm   },

      // Trade board
      { path: "trade",           Component: TradeBoard       },
      { path: "trade/new",       Component: TradeBoardForm   },
      { path: "trade/:id",       Component: TradeBoardDetail },
      { path: "trade/:id/edit",  Component: TradeBoardForm   },

      // Chat
      { path: "chats", Component: ChatList },

      // User
      { path: "profile", Component: Profile },
      { path: "*",       Component: NotFound },
    ],
  },
  { path: "/login",  Component: Login  },
  { path: "/signup", Component: Signup },
]);
