import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Marketplace } from "@/app/community/pages/Marketplace";
import { ProductDetail } from "@/app/community/pages/ProductDetail";
import { Auctions } from "@/app/auction/pages/Auctions";
import { AuctionDetail } from "@/app/auction/pages/AuctionDetail";
import { FlashSale } from "@/app/auction/pages/FlashSale";
import { Profile } from "@/app/user/pages/Profile";
import { Login } from "@/app/auth/pages/Login";
import { Signup } from "@/app/auth/pages/Signup";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "marketplace", Component: Marketplace },
      { path: "auctions", Component: Auctions },
      { path: "auctions/:auctionId", Component: AuctionDetail },
      { path: "flash-sale", Component: FlashSale },
      { path: "product/:id", Component: ProductDetail },
      { path: "profile", Component: Profile },
      { path: "*", Component: NotFound },
    ],
  },
  { path: "/login", Component: Login },
  { path: "/signup", Component: Signup },
]);
