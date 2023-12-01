/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  },
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
}

module.exports = nextConfig
