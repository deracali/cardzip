const nextConfig = {
  outputFileTracingRoot: process.cwd(),
  pageExtensions: ["ts", "tsx"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
