import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { validateToken } from "@/lib/auth/tokenValidator";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  // If no token is provided, return a 401 error
  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  const { valid, decodedToken, error } = await validateToken(
    token,
    ["openid", "email", "profile"],
    {
      authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY || "",
    }
  );

  if (!valid) {
    return NextResponse.json({ error: error?.message }, { status: 401 });
  }

  return NextResponse.json({
    message: "This data is private",
    user: {
      sub: decodedToken?.sub,
      username: decodedToken?.username,
      scopes: decodedToken?.scope,
    },
  });
}
