import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/camara/:path*",
        destination: "https://dadosabertos.camara.leg.br/api/v2/:path*",
      },
    ];
  },
};

export default withFlowbiteReact(nextConfig);
