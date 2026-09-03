import { useEffect, useState } from "react";
import PostCard from "../../components/PostCard/PostCard";
import Sidebar from "../../components/Sidebar/Sidebar";
import SuggestionsSidebar from "../../components/SuggestionsSidebar/SuggestionsSidebar";
import { getNewsFeed } from "../../services/newsfeed.services";
import type { PostCardI } from "../../types/postCard";
import PostCardSkeleton from "../../components/PostCard/PostSkeleton";

export default function Newsfeed() {
  const [posts, setPosts] = useState<PostCardI[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function getPosts() {
    try {
      const { data } = await getNewsFeed();
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
  }, []);

  return (
    <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
      <div className="xl:order-1">
        <Sidebar />
      </div>

      <div className="xl:order-3">
        <SuggestionsSidebar />
      </div>

      <section aria-label="Posts feed" className="space-y-4  xl:order-2">
        {isLoading ? (
          <PostCardSkeleton />
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} refatchPosts={getPosts} />
          ))
        )}
      </section>
    </div>
  );
}
