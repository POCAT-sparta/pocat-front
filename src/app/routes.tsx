import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Marketplace } from "../features/community/pages/Marketplace";
import { ProductDetail } from "../features/community/pages/ProductDetail";
import { Auctions } from "../features/auction/pages/Auctions";
import { AuctionDetail } from "../features/auction/pages/AuctionDetail";
import { FlashSale } from "../features/auction/pages/FlashSale";
import { Profile } from "../features/user/pages/Profile";
import { Login } from "../features/auth/pages/Login";
import { Signup } from "../features/auth/pages/Signup";

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
