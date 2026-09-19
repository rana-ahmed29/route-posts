
import { useEffect } from "react";

export default function usePageTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | Route Posts` : "Route Posts";

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}