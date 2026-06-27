import "./src/env";

import type { NextConfig } from "next";

const config: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "picsum.photos",
            },
        ],
    },
};

export default config;
