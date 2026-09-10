/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['src', '__tests__'], 
  },
  output: "standalone",
  images: {
    domains: ['proext.ufba.br'],
  },
  async redirects() {
    return [
      {
        source: "/users/confirm-email",
        destination: "/confirmar-email",
        permanent: false,
      },
    ];
  },
};



export default nextConfig;
