import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AGENTS.md is the team's hackathon guide; stop `next dev` from injecting its own block.
  agentRules: false,
};

export default nextConfig;
