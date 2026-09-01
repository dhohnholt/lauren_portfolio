const optimizedImageHosts = new Set(["i.postimg.cc", "images.unsplash.com"]);

export function canOptimizeImage(url: string) {
  try {
    return optimizedImageHosts.has(new URL(url).hostname);
  } catch {
    return false;
  }
}
