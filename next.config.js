/** @type {import('next').NextConfig} */
const nextConfig = {
  // headers: () => [
  //   {
  //     source: '/test',
  //     headers: [
  //       {
  //         key: 'Cache-Control',
  //         value: 'no-store',
  //       },
  //     ],
  //   },
  // ],

  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
}

module.exports = nextConfig
