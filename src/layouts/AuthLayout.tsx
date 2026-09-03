import { Outlet } from "react-router";
import AuthIntro from "../components/AuthIntro/AuthIntro";



export default function AuthLayout() {
  return (
    <>
      <main className="bg-[#f0f2f5] min-h-screen lg:flex items-center px-4 py-8 sm:py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="col-span-5 lg:col-span-3 order-2 lg:order-1  ">
            <AuthIntro />
          </div>
          <div className="col-span-5 lg:col-span-2 order-1 lg:order-2">
            <Outlet/>
          </div>
        </div>
      </main>
    </>
  );
}
