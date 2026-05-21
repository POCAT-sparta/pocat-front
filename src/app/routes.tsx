import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { Marketplace } from "./pages/Marketplace";
import { Auctions } from "./pages/Auctions";
import { FlashSale } from "./pages/FlashSale";
import { ProductDetail } from "./pages/ProductDetail";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";

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
