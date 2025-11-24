/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable source maps in production to prevent 404 errors for .map files
  productionBrowserSourceMaps: false,
  
  // Disable source maps for CSS and JavaScript (only in production)
  webpack: (config, { dev }) => {
    // Only disable source maps in production builds
    // Next.js requires eval-source-map in dev mode for proper debugging
    if (!dev) {
      config.devtool = false;
      
      // Disable CSS source maps in production
      if (config.module && config.module.rules) {
        config.module.rules.forEach((rule) => {
          if (rule.test && rule.test.toString().includes('css')) {
            if (rule.use) {
              rule.use.forEach((use) => {
                if (use.loader && typeof use.loader === 'string' && use.loader.includes('css-loader')) {
                  use.options = {
                    ...(use.options || {}),
                    sourceMap: false,
                  };
                }
                if (use.loader && typeof use.loader === 'string' && use.loader.includes('postcss-loader')) {
                  use.options = {
                    ...(use.options || {}),
                    sourceMap: false,
                  };
                }
              });
            }
          }
        });
      }
    }
    
    return config;
  },
  
  // Output standalone for Docker
  output: 'standalone',
};

export default nextConfig;

