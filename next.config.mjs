/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static site: `next build` writes plain HTML/CSS/JS to `out/` for Cloudflare.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
