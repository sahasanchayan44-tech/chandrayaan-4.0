/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production' || process.env.NEXT_EXPORT === 'true';

const nextConfig = {
  ...(isProd ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
