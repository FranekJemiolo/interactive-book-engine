export function getBasePath(): string {
  const hostname = window.location.hostname;
  if (hostname.includes('github.io')) {
    // Extract the repo name from the path (e.g., /interactive-book-engine/)
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      return `/${pathParts[0]}/`;
    }
  }
  return '/';
}
