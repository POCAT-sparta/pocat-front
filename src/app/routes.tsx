import { createBrowserRouter, Navigate } from "react-router";
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
import { MyOrders } from "@/app/order/pages/MyOrders";
import { OrderDetail } from "@/app/order/pages/OrderDetail";
import { CardCatalog } from "@/app/card/pages/CardCatalog";
import { CardDetail } from "@/app/card/pages/CardDetail";
import { CardRegister } from "@/app/card/pages/CardRegister";
import { AdminRoute } from "@/app/admin/components/AdminRoute";
import { AdminLayout } from "@/app/admin/components/AdminLayout";
import { AdminUsers } from "@/app/admin/pages/AdminUsers";
import { AdminCards } from "@/app/admin/pages/AdminCards";
import { AdminCatalog } from "@/app/admin/pages/AdminCatalog";
import { AdminAuctions } from "@/app/admin/pages/AdminAuctions";
import { AdminOrders } from "@/app/admin/pages/AdminOrders";
import { AdminSettlements } from "@/app/admin/pages/AdminSettlements";
import { AdminRefunds } from "@/app/admin/pages/AdminRefunds";
import { AdminAi } from "@/app/admin/pages/AdminAi";

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

      // Card catalog
      { path: "cards",           Component: CardCatalog },
      { path: "cards/register",  Component: CardRegister },
      { path: "cards/:cardId",   Component: CardDetail  },

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

      // Order
      { path: "orders",            Component: MyOrders   },
      { path: "orders/:orderUid",  Component: OrderDetail },

      // Chat
      { path: "chats", Component: ChatList },

      // User
      { path: "profile", Component: Profile },
      { path: "*",       Component: NotFound },
    ],
  },
  { path: "/login",  Component: Login  },
  { path: "/signup", Component: Signup },
  // Admin (ADMIN 권한 필수 — AdminRoute 가드)
  {
    path: "/admin",
    Component: AdminRoute,
    children: [
      {
        Component: AdminLayout,
        children: [
          { index: true, element: <Navigate to="users" replace /> },
          { path: "users",       Component: AdminUsers       },
          { path: "cards",       Component: AdminCards       },
          { path: "catalog",     Component: AdminCatalog     },
          { path: "auctions",    Component: AdminAuctions    },
          { path: "orders",      Component: AdminOrders      },
          { path: "settlements", Component: AdminSettlements },
          { path: "refunds",     Component: AdminRefunds     },
          { path: "ai",          Component: AdminAi          },
        ],
      },
    ],
  },
]);
