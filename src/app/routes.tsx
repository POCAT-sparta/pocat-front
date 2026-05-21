import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Marketplace } from "../features/community/pages/Marketplace";
import { ProductDetail } from "../features/community/pages/ProductDetail";
import { Auctions } from "../features/auction/pages/Auctions";
import { FlashSale } from "../features/auction/pages/FlashSale";
import { Profile } from "../features/user/pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "marketplace", Component: Marketplace },
      { path: "auctions", Component: Auctions },
      { path: "flash-sale", Component: FlashSale },
      { path: "product/:id", Component: ProductDetail },
      { path: "profile", Component: Profile },
      { path: "*", Component: NotFound },
    ],
  },
]);
