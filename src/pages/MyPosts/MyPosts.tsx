import { useContext, useEffect, useState } from "react";
import PostCard from "../../components/PostCard/PostCard";
import Sidebar from "../../components/Sidebar/Sidebar";
import SuggestionsSidebar from "../../components/SuggestionsSidebar/SuggestionsSidebar";
import { getUserPosts } from "../../services/posts.services";
import type { PostCardI } from "../../types/postCard";
import PostCardSkeleton from "../../components/PostCard/PostSkeleton";
import AddPost from "../../components/PostCard/AddPost";
import PublishingPostCard from "../../components/PostCard/PublishingPostCard";
import { userContext } from "../../context/UserContext";
import usePageTitle from "../../hooks/usePageTitle";

type PendingPost = {
  tempId: string;
  body: string;
  imageUrl?: string;
  progress: number;
};

export default function MyPosts() {
  usePageTitle("MyPosts");
  const { userData } = useContext(userContext);
  const [posts, setPosts] = useState<PostCardI[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingPost, setPendingPost] = useState<PendingPost | null>(null);

  async function getPosts() {
    if (!userData?._id) return;
    try {
      const { data } = await getUserPosts(userData._id);
      const posts: PostCardI[] = data.data.posts;
      setPosts(posts);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?._id]);

  return (
    <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
      <div className="xl:order-1">
        <Sidebar />
      </div>

      <div className="xl:order-3">
        <SuggestionsSidebar />
      </div>

      <section aria-label="My posts" className="space-y-4  xl:order-2">
        <AddPost
          refatchPosts={getPosts}
          onPendingPost={setPendingPost}
          onPostCreated={(newPost) => setPosts((prev) => [newPost, ...prev])}
        />

        {pendingPost && (
          <PublishingPostCard
            body={pendingPost.body}
            imageUrl={pendingPost.imageUrl}
            progress={pendingPost.progress}
          />
        )}

        {isLoading ? (
          <PostCardSkeleton />
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
            You haven't posted anything yet.
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} refatchPosts={getPosts} />
          ))
        )}
      </section>
    </div>
  );
}
