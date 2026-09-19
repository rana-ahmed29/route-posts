import { RouterProvider, createBrowserRouter, Navigate } from "react-router";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Profile from "./pages/Profile/Profile";
import Newsfeed from "./pages/NewsFeed/NewsFeed";
import Notfound from "./pages/Notfound/Notfound";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import AppProtectedRoutes from "./components/ProtectedRoutes/AppProtectedRoutes";
import AuthProtectedRoutes from "./components/ProtectedRoutes/AuthProtectedRoutes";
import Notifications from "./pages/Notifications/Notifications";

import PostDetails from "./pages/PostDetails/PostDetails";
import Settings from "./pages/Settings/Settings";
import Community from "./pages/Community/Community";
import Saved from "./pages/Saved/Saved";
import MyPosts from "./pages/MyPosts/MyPosts";

export default function App() {
  const router = createBrowserRouter([
    {
      path: "/auth",
      element: (
        <AuthProtectedRoutes>
          <AuthLayout />
        </AuthProtectedRoutes>
      ),
      children: [
        { index: true, element: <Navigate to={"Login"} /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
      ],
    },
    {
      path: "",
      element: (
        <AppProtectedRoutes>
          <MainLayout />
        </AppProtectedRoutes>
      ),
      children: [
        { index: true, element: <Navigate to={"/feed"} /> },
        { path: "/profile", element: <Profile /> },
        { path: "/feed", element: <Newsfeed /> },
        { path: "/notifications", element: <Notifications /> },
        { path: "/settings", element: <Settings /> },
        { path: "/community", element: <Community /> },
        { path: "/saved", element: <Saved /> },
        { path: "/my-posts", element: <MyPosts /> },
        { path: "/postDetails/:postId", element: <PostDetails /> },
      ],
    },
    { path: "*", element: <Notfound /> },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
