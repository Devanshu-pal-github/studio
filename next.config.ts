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
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // Only apply these fixes to client-side bundles
    if (!isServer) {
      // Fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        child_process: false,
        tls: false,
        crypto: false,
        stream: false,
        os: false,
        path: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        url: false,
        util: false,
        querystring: false,
        punycode: false,
        buffer: false,
        events: false,
        'fs/promises': false,
        'timers/promises': false,
      };

      // Mark server-only packages as external
      config.externals = [
        ...(config.externals || []),
        'mongodb',
        'mongodb-client-encryption',
        'aws4',
        'snappy',
        'socks',
        'saslprep',
        'bson-ext',
        'kerberos',
        '@mongodb-js/zstd',
        'gcp-metadata',
        'aws-crt',
        'child_process',
        'fs',
        'net',
        'dns',
        'tls',
        'crypto',
        'stream',
        'os',
        'path',
        'zlib',
        'http',
        'https',
        'fs/promises',
        'timers/promises',
      ];

      // Completely ignore ALL MongoDB-related modules in client bundle
      config.module.rules.push(
        {
          test: /node_modules\/mongodb\//,
          use: 'null-loader',
        },
        {
          test: /mongocryptd_manager\.js$/,
          use: 'null-loader',
        },
        {
          test: /client-side-encryption/,
          use: 'null-loader',
        },
        {
          test: /node_modules\/.*\/lib\/client-side-encryption\//,
          use: 'null-loader',
        },
        {
          test: /mongodb.*\.js$/,
          use: 'null-loader',
        },
        {
          test: /@mongodb-js/,
          use: 'null-loader',
        },
        {
          test: /gcp-metadata/,
          use: 'null-loader',
        },
        {
          test: /https-proxy-agent/,
          use: 'null-loader',
        }
      );

      // Replace mongodb imports with empty module for client
      config.resolve.alias = {
        ...config.resolve.alias,
        mongodb: false,
        'mongodb/lib/client-side-encryption/mongocryptd_manager': false,
        'mongodb/lib/client-side-encryption': false,
        'child_process': false,
        '@mongodb-js/zstd': false,
        'mongodb-client-encryption': false,
        'gcp-metadata': false,
        'fs/promises': false,
        'timers/promises': false,
      };

      // Additional plugin to ignore server-only modules
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(mongodb|child_process|fs|net|tls|crypto|dns|gcp-metadata|fs\/promises|timers\/promises)$/,
        })
      );
    }

    return config;
  },
};

export default nextConfig;
