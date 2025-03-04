import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        search: '',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        search: '',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // 如果是服务端构建，添加 node-loader 处理 .node 文件
    if (isServer) {
      config.module.rules.push({
        test: /\.node$/,
        use: 'node-loader',
      });
    }

    return config;
  },
};

export default nextConfig;
