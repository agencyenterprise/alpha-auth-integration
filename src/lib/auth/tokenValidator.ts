import jwt, { JwtPayload, JwtHeader } from "jsonwebtoken";
import jwksRsa from "jwks-rsa";

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


const DEFAULT_AUTHORITY = process.env.NEXT_PUBLIC_COGNITO_AUTHORITY || process.env.COGNITO_AUTHORITY || "";

const jwks = jwksRsa({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
  jwksUri: `${DEFAULT_AUTHORITY}/.well-known/jwks.json`,
})

async function getKey(header: JwtHeader) {
  const key = await jwks.getSigningKey(header.kid);
  return key.getPublicKey();
}

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

    const secret = await getKey(decodedJwt.header);
    // Verify the token
    const verified = jwt.verify(token, secret, {
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
