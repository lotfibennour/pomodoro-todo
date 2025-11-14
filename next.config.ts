import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
    output: 'standalone',
    reactCompiler: true,
    trailingSlash: true,
    // Remove distDir - standalone mode uses .next directory
    // distDir: 'out', // ❌ REMOVE THIS LINE
    images: {
        unoptimized: true
    },
    experimental: {
    },
};

const isTauri = process.env.TAURI_ENV === 'true';

if (isTauri) {
  nextConfig.assetPrefix = './';
}
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);