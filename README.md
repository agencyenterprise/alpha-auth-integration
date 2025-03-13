# Alpha Auth Integration

A demonstration project showcasing AWS Cognito implementation for multi-service authentication and authorization patterns. 

The Alpha 1edtech platform can make use of the code and docs contained here to understand how to integrate their own services and tools with the infrastructure of the platform.

## Overview

This repository implements three key authentication scenarios for a microservices architecture:

1. **User Authentication (SSO)** - Centralized user authentication with token management, uses PKCE Auth flow for secure handshaking without the need for a client secret.
    - Note: The SSO aspect of the architecture will work in the form of LTI ToolLaunch messages, the receiving party (tool) will receive the tool launch message together with the user access token, which will then be validated against the public keys in cognito IDP
2. **Application Authentication of Users** - Token validation and authorization enforcement
3. **Machine-to-Machine Authentication** - Service-to-service authentication using OAuth 2.0 Client Credentials flow

Each scenario includes a fully functional implementation with UI and backend components to demonstrate real-world usage patterns.

## Technologies

- **Next.js** (Frontend and API routes)
- **AWS Cognito** (Identity provider)
- **react-oidc-context** (OpenID Connect implementation)
- **JWT validation library** (Custom token validation)

## Getting Started

### Prerequisites

- Node.js 18+
- AWS account with Cognito configured
- Required environment variables (see below)

### Environment Variables

Create a `.env.local` file with the following:

```
NEXT_PUBLIC_COGNITO_AUTHORITY="https://cognito-idp.[region].amazonaws.com/[user-pool-id]"
NEXT_PUBLIC_COGNITO_CLIENT_ID="[app-client-id]"
NEXT_PUBLIC_COGNITO_DOMAIN="https://[your-domain].auth.[region].amazoncognito.com"

# For M2M auth (Scenario 3)
NEXT_PUBLIC_CLIENT1_ID="[service-client-1-id]"
NEXT_PUBLIC_CLIENT1_SECRET="[service-client-1-secret]"
NEXT_PUBLIC_CLIENT1_SCOPES="[space-separated-scopes]"
NEXT_PUBLIC_CLIENT2_ID="[service-client-2-id]"
NEXT_PUBLIC_CLIENT2_SECRET="[service-client-2-secret]"
NEXT_PUBLIC_CLIENT2_SCOPES="[space-separated-scopes]"
NEXT_PUBLIC_M2M_DEFAULT_SCOPES="[default-scope-for-validation]"
```

### Installation

```bash
npm install
npm run dev
```

## Core Authentication Library

The token validation library ([src/lib/auth/tokenValidator.ts](src/lib/auth/tokenValidator.ts)) is the central reusable component for all microservices that need to validate tokens. This library:

- Validates JWT signatures against Cognito JWKS
- Verifies token expiration and issuer
- Checks required scopes for authorization
- Caches JWKS data for performance

```typescript
// Example usage in a microservice
import { validateToken } from '@/lib/auth/tokenValidator';

// User token validation
const { valid, decodedToken, error } = await validateToken(
  token,
  ['required:scope'],
  {
    authority: process.env.COGNITO_AUTHORITY
  }
);

if (!valid) {
  // Handle unauthorized access
}
```

## Learning from Each Scenario

### Scenario 1: User Authentication

Demonstrates:
- Complete OAuth authentication flow
- Token inspection and management
- Token refresh implementation

Key files:
- `src/app/scenario1/AuthComponent.tsx` - Authentication UI component
- `src/app/scenario1/refreshTokenUtils.ts` - Token refresh implementation

### Scenario 2: Application Authentication

Demonstrates:
- Token validation in API routes
- Scope-based authorization
- Error handling for invalid tokens

Key files:
- `src/app/scenario2/api/getData/route.ts` - Token validation in API routes
- `src/app/scenario2/ProtectedResource.tsx` - Frontend requesting protected resources

### Scenario 3: Machine-to-Machine Authentication

Demonstrates:
- Client credentials flow implementation
- Service client configuration
- Scope-based authorization for services

Key files:
- `src/app/scenario3/api/generate-token/route.ts` - Client credentials implementation
- `src/app/scenario3/api/validate-token/route.ts` - M2M token validation

## Using in Production

For production use:
1. Implement secure token storage
2. Set appropriate token lifetimes
3. Add proper error handling and logging
4. Consider implementing token caching for performance
5. Set up monitoring for authentication events
