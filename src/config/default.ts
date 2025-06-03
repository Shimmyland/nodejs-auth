import dotenv from "dotenv";

dotenv.config({ path: ".env" }); // dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

export default Object.freeze({
  port: process.env.PORT || 3000,
  apiKey: process.env.API_KEY || null,
  JWT_SECRET: process.env.JWT_SECRET || null,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || null,
  google: {
    providerUrl: process.env.GOOGLE_AUTH_URL || null,
    clientId: process.env.GOOGLE_CLIENT_ID || null,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || null,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || null,
    scope: process.env.GOOGLE_SCOPE || null,
  },
  github: {
    providerUrl: process.env.GITHUB_AUTH_URL || null,
    clientId: process.env.GITHUB_CLIENT_ID || null,
    clientSecret: process.env.GITHUB_CLIENT_SECRET || null,
    redirectUri: process.env.GITHUB_REDIRECT_URI || null,
    scope: process.env.GITHUB_SCOPE || null,
  },
  discord: {
    providerUrl: process.env.DISCORD_AUTH_URL || null,
    clientId: process.env.DISCORD_CLIENT_ID || null,
    clientSecret: process.env.DISCORD_CLIENT_SECRET || null,
    redirectUri: process.env.DISCORD_REDIRECT_URI || null,
    scope: process.env.DISCORD_SCOPE || null,
  },
});
