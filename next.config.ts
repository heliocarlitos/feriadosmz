import type { NextConfig } from "next"

const configuracao: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: process.cwd()
  },
  async headers() {
    return [
      {
        // API pública: qualquer origem pode consultá-la.
        source: "/api/:caminho*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" }
        ]
      }
    ]
  }
}

export default configuracao
