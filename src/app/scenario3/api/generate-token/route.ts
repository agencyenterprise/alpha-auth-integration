import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { clientId, clientSecret, tokenEndpoint, scopes } =
      await request.json();

    // Validate required parameters
    if (!clientId || !clientSecret || !tokenEndpoint) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    console.log({ clientId, clientSecret, tokenEndpoint, scopes });

    // Prepare the request to the token endpoint
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);
    if (scopes) {
      params.append("scope", scopes);
    }

    try {
      // Make the request to the token endpoint
      const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      // Parse the response
      const data = await response.json();

      // Check if the request was successful
      if (!response.ok) {
        console.log({ data });
        return NextResponse.json(
          {
            message: "Failed to generate token",
            error: data.error,
            error_description: data.error_description,
          },
          { status: response.status }
        );
      }

      // Return the token response
      return NextResponse.json(data);
    } catch (error) {
      console.error("Error fetching token:", error);
      return NextResponse.json(
        { message: "Error connecting to token endpoint" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
