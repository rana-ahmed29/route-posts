import { Outlet } from "react-router";
import Navbar from "../components/Navbar/Navbar";

export default function MainLayout() {
  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-[1400px] px-3 py-3.5">
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </>
  );
}
