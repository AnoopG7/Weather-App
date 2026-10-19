import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppLayout() {
  return (
    <div className="linen-shell flex flex-col min-h-screen">
      <div className="linen-grid" aria-hidden="true" />
      <Navbar />
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
