import { useQuery } from "@tanstack/react-query";

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const fetchImages = async (page = 1) => {
  const response = await fetch(
    `https://api.unsplash.com/photos?page=${page}&per_page=20&order_by=latest&client_id=${UNSPLASH_ACCESS_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch images");
  }

  return response.json();
};

export const useUnsplashImages = (page) => {
  return useQuery({
    queryKey: ["unsplash-images", page],
    queryFn: () => fetchImages(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
