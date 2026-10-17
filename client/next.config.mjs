/** @type {import('next').NextConfig} */
const nextConfig = {
  // Separate dev output so `next build` never clobbers a running `next dev`.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // The 2FA page was removed; send old links and bookmarks to the dashboard.
  async redirects() {
    return [{ source: '/verify-2fa', destination: '/dashboard', permanent: false }];
  },
};

export default nextConfig;
