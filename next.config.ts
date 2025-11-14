import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
    output: 'export',
    reactCompiler: true,
    trailingSlash: true,
    distDir: 'out',
    images: {
        unoptimized: true
    },
    // Disable server-side features that won't work in Tauri
    experimental: {
    },
};

const isTauri = process.env.TAURI_ENV === 'true';

if (isTauri) {
  nextConfig.assetPrefix = './';
}
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
