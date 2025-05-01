import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pubchem.ncbi.nlm.nih.gov',
        port: '',
        pathname: '/rest/pug/compound/cid/**/PNG', // Allow specific image paths
      },
       {
        protocol: 'https',
        hostname: 'via.placeholder.com', // Allow placeholder images
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
