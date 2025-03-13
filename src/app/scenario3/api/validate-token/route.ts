import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { validateToken } from "@/lib/auth/tokenValidator";

// This is a simplified token validation for demonstration purposes
// In a real application, you would use proper JWT validation with JWKs
export async function POST(request: NextRequest) {
  const { token, requiredScopes } = await request.json();

  if (!token) {
    return NextResponse.json({ message: "Token is required" }, { status: 400 });
  }

  const { valid, error } = await validateToken(token, requiredScopes, {
    authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY || "",
  });

  if (!valid && error) {
    console.log({ error });
    return NextResponse.json(
      {
        error: {
          message: error?.message,
          status: error?.status,
        },
      },
      { status: error?.status || 401 }
    );
  }

  return NextResponse.json({
    message: "Token is valid, you can pass",
  });
}
