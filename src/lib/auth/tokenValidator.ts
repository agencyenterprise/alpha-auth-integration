import jwt, { JwtPayload } from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";

type JWK = {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
};

type JWKRepository = {
  keys: JWK[];
};

export class ValidateTokenError extends Error {
  status: number;

  constructor(message: string, status: number = 401) {
    super(message);
    this.name = "ValidateTokenError";
    this.status = status;
  }
}

export interface ValidationResult {
  valid: boolean;
  decodedToken: JwtPayload | null;
  error?: ValidateTokenError;
}

let jwksCache: JWKRepository | null = null;
let jwksCacheTime: number = 0;
const JWKS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

/**
 * Fetches the JWKS (JSON Web Key Set) from the authority
 * @param authority The authority URL (e.g., Cognito user pool URL)
 * @returns The JWKS repository
 */
async function getJwks(authority: string): Promise<JWKRepository> {
  const currentTime = Date.now();

  // Use cached JWKS if available and not expired
  const lifetime = currentTime - jwksCacheTime;
  if (jwksCache && lifetime < JWKS_CACHE_DURATION) {
    return jwksCache;
  }

  try {
    const jwksUri = `${authority}/.well-known/jwks.json`;
    const response = await fetch(jwksUri);

    if (!response.ok) {
      throw new ValidateTokenError(
        `Failed to fetch JWKS: ${response.statusText}`,
        500
      );
    }

    const data = (await response.json()) as JWKRepository;
    jwksCache = data;
    jwksCacheTime = currentTime;

    return jwksCache;
  } catch (error) {
    if (error instanceof ValidateTokenError) {
      throw error;
    }
    throw new ValidateTokenError(
      `Failed to fetch JWKS: ${(error as Error).message}`,
      500
    );
  }
}

const DEFAULT_AUTHORITY = process.env.NEXT_PUBLIC_COGNITO_AUTHORITY || "";

/**
 * Validates a JWT token against the provided authority and required scopes
 * @param token The JWT token to validate
 * @param requiredScopes Array of scopes that the token must have
 * @param options Additional options for validation
 * @returns A validation result object
 */
export async function validateToken(
  token: string,
  requiredScopes: string[] = [],
  options: {
    authority: string;
    issuer?: string;
  } = {
    authority: DEFAULT_AUTHORITY,
  }
): Promise<ValidationResult> {
  try {
    if (!token) {
      throw new ValidateTokenError("No token provided");
    }

    const authority = options.authority;
    if (!authority) {
      throw new ValidateTokenError(
        "Authority not provided and NEXT_PUBLIC_COGNITO_AUTHORITY not set",
        500
      );
    }

    // Decode the token without verification to get the kid
    const decodedJwt = jwt.decode(token, { complete: true });
    if (!decodedJwt || typeof decodedJwt !== "object") {
      throw new ValidateTokenError("Invalid token format");
    }

    const kid = decodedJwt.header.kid;
    if (!kid) {
      throw new ValidateTokenError("Token missing 'kid' in header");
    }

    // Get the JWKS
    const jwks = await getJwks(authority);
    const jwk = jwks.keys.find((key: JWK) => key.kid === kid);

    if (!jwk) {
      throw new ValidateTokenError("Token key (kid) not found in JWKS");
    }

    // Check if the JWK is an RSA key
    if (jwk.kty !== "RSA") {
      throw new ValidateTokenError(
        "Unsupported key type, only RSA is supported"
      );
    }

    // Convert JWK to PEM
    const pem = jwkToPem(jwk as jwkToPem.RSA);

    // Verify the token
    const verified = jwt.verify(token, pem, {
      issuer: options.issuer || authority,
    }) as JwtPayload;

    if (!verified) {
      throw new ValidateTokenError("Token verification failed");
    }

    // Check for required scopes if any are specified
    if (requiredScopes.length > 0) {
      const tokenScopes = verified.scope ? verified.scope.split(" ") : [];
      const missingScopes = requiredScopes.filter(
        (scope) => !tokenScopes.includes(scope)
      );

      if (missingScopes.length > 0) {
        throw new ValidateTokenError(
          `Missing required scopes: ${missingScopes.join(", ")}`,
          403
        );
      }
    }

    return {
      valid: true,
      decodedToken: verified,
    };
  } catch (error) {
    if (error instanceof ValidateTokenError) {
      return {
        valid: false,
        decodedToken: null,
        error,
      };
    }

    // Handle jwt.verify errors
    if (error instanceof Error) {
      const status = error.name === "TokenExpiredError" ? 401 : 400;
      const tokenError = new ValidateTokenError(error.message, status);

      return {
        valid: false,
        decodedToken: null,
        error: tokenError,
      };
    }

    // Fallback for unknown errors
    return {
      valid: false,
      decodedToken: null,
      error: new ValidateTokenError(
        "Unknown error during token validation",
        500
      ),
    };
  }
}
