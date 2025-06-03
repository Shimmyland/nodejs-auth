import env from "../config/default.js";
import { ConfigError } from "./errors.js";
import got from "got";

type UserDTO = {
  email: string;
  name: string;
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
};

interface AuthStrategy {
  getAuthUrl(): string;
  handleCallback(code: string): Promise<UserDTO>;
}

abstract class Auth implements AuthStrategy {
  constructor(
    protected clientId: string,
    protected clientSecret: string,
    protected redirectUri: string,
    protected scope: string,
    protected providerUrl: string,
  ) {}

  getAuthUrl(): string {
    const url = new URL(this.providerUrl);
    url.searchParams.set("client_id", this.clientId);
    url.searchParams.set("redirect_uri", this.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", this.scope);
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    return url.toString();
  }

  abstract handleCallback(code: string): Promise<UserDTO>;
}

class GoogleAuthStrategy extends Auth {
  constructor() {
    const { clientId, clientSecret, redirectUri, scope, providerUrl } =
      env.google;
    if (!clientId || !clientSecret || !redirectUri || !scope || !providerUrl) {
      throw new ConfigError("Missing Google OAuth config params.");
    }
    super(clientId, clientSecret, redirectUri, scope, providerUrl);
  }

  async handleCallback(code: string): Promise<UserDTO> {
    try {
      if (!code) throw new Error("Authorization code is required.");

      // authorization with Google OAuth 2.0
      const getToken = (await got
        .post("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          json: {
            code,
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: this.redirectUri,
            grant_type: "authorization_code",
          },
        })
        .json()) as {
        access_token: string;
        expires_in: number;
        refresh_token: string;
        scope: string;
        id_token: string;
      };
      /*returns: {
                "access_token": "ya29.a0ARrdaM...",
                "expires_in": 3599,
                "refresh_token": "1//0eX1c2q7...",
                "scope": "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
                "token_type": "Bearer",
                "id_token": "ey..."  <--- this is the ID token, which contains user information!
            }*/

      /*
                to decode the ID token, use library like jose (easier)
                or download Google JWKs - https://www.googleapis.com/oauth2/v3/certs, 
                choose the kid from the header of the ID token,
                and convert it to public key (PEM format).
                Then use jwt.verify() from jsonwebtoken library to verify the signature.
            */

      // authentication with Google UserInfo API to get user data
      const getUserInfo = (await got
        .get("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: {
            Authorization: `Bearer ${getToken.access_token}`,
          },
        })
        .json()) as {
        email: string;
        verified_email: boolean;
        name: string;
      };
      /*returns: {
                "id": "1234567890",
                "email": "",
                "verified_email": true,
                "name": "John Doe",
                "given_name": "John",
                "family_name": "Doe",
                "picture": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..."
            }*/

      console.log("getUserInfo", getUserInfo);
      return {
        name: getUserInfo.name,
        email: getUserInfo.email,
        accessToken: getToken.access_token,
        idToken: getToken.id_token,
        refreshToken: getToken.refresh_token,
      };
    } catch (err) {
      throw err;
    }
  }
}

class GithubAuthStrategy extends Auth {
  constructor() {
    const { clientId, clientSecret, redirectUri, scope, providerUrl } =
      env.github;
    if (!clientId || !clientSecret || !redirectUri || !scope || !providerUrl) {
      throw new ConfigError("Missing Github OAuth config params.");
    }
    super(clientId, clientSecret, redirectUri, scope, providerUrl);
  }

  async handleCallback(code: string): Promise<UserDTO> {
    if (!code) throw new Error("Authorization code is required.");

    // authorization with Github OAuth 2.0
    const getToken = (await got
      .post("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        json: {
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          grant_type: "authorization_code",
        },
      })
      .json()) as {
      access_token: string;
    };
    /* returns: {
            "access_token": "gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            "token_type": "bearer",
            "scope": "read:user,user:email"
        } */

    // authentication with Github User API to get user data
    const getUser = (await got
      .get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${getToken.access_token}`,
        },
      })
      .json()) as {
      name: string;
      email: string;
    };

    if (getUser.email === null) {
      const getEmail = (await got
        .get("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${getToken.access_token}`,
            "User-Agent": "MyApp",
          },
        })
        .json()) as {
        email: string;
        verified: boolean;
        primary: boolean;
      }[];
      /*returns: [
                {
                    "email": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                    "verified": true,
                    "primary": true,
                    "visibility": "public"
                }
            ]*/
      getUser.email = getEmail.find((email) => email.primary)?.email || "";
    }

    return {
      name: getUser.name,
      email: getUser.email,
      accessToken: getToken.access_token,
    };
  }
}

class DiscordAuthStrategy extends Auth {
  constructor() {
    const { clientId, clientSecret, redirectUri, scope, providerUrl } =
      env.discord;
    if (!clientId || !clientSecret || !redirectUri || !scope || !providerUrl) {
      throw new ConfigError("Missing Discord OAuth config params.");
    }
    super(clientId, clientSecret, redirectUri, scope, providerUrl);
  }

  async handleCallback(code: string): Promise<UserDTO> {
    try {
      if (!code) throw new Error("Authorization code is required.");

      // authorization with Discord OAuth 2.0
      const getToken = await got
        .post("https://discord.com/api/oauth2/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          form: {
            code,
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: this.redirectUri,
            grant_type: "authorization_code",
          },
        })
        .json<{
          access_token: string;
          expires_in: number;
          refresh_token: string;
        }>();
      /*
            returns: {
                "token_type": "Bearer",
                "access_token": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                "expires_in": 604800,
                "refresh_token": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                "scope": "identify email"
            }
            */

      // authentication with Discord User API to get user data
      const getUser = await got
        .get("https://discord.com/api/users/@me", {
          headers: {
            Authorization: `Bearer ${getToken.access_token}`,
          },
        })
        .json<{ global_name: string; email: string }>();
      /*
            returns: {
                lot of stuff around user
            }
            */

      return {
        name: getUser.global_name,
        email: getUser.email,
        accessToken: getToken.access_token,
        refreshToken: getToken.refresh_token,
      };
    } catch (err) {
      throw err;
    }
  }
}

export class AuthStrategyFactory {
  static createAuthStrategy(type: string): AuthStrategy {
    switch (type) {
      case "google":
        return new GoogleAuthStrategy();
      case "github":
        return new GithubAuthStrategy();
      case "discord":
        return new DiscordAuthStrategy();
      //            case 'apple':
      //                return new AppleAuth()
      //            case 'facebook':
      //                return new FacebookAuth()
      default:
        throw new Error("Invalid auth type");
    }
  }
}
