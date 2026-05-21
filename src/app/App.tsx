import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";
import { AuthProvider } from "@/app/auth/context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
