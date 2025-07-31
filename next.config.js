/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@heartexlabs/label-studio'],
  // Only apply webpack config when not using Turbopack
  ...(process.env.TURBOPACK ? {} : {
    webpack: (config) => {
      // Label Studio touches some Node APIs; disable them in the browser build
      config.resolve.fallback = { 
        ...config.resolve.fallback,
        fs: false, 
        path: false, 
        os: false 
      };
      return config;
    },
  }),
};

module.exports = nextConfig; 