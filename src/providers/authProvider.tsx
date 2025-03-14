"use client";

import React from "react";
import {
  AuthProviderProps,
  AuthProvider as OidcAuthProvider,
} from "react-oidc-context";

import { Log } from "oidc-client-ts";
Log.setLogger(console);

// Function to safely construct the redirect URI
const getRedirectUri = () => {
  if (typeof window === "undefined") {
    // Return a default during server-side rendering
    return process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI || "";
  }

  // Use the environment variable if available, otherwise construct from window.location
  return (
    process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI ||
    `${window.location.origin}/scenario1/callback`
  );
};

const cognitoAuthConfig = {
  authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY || "",
  client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "",
  // client_secret: NEVER_EVER_EXPOSE_THIS_SECRET_IN_CLIENT_SIDE_CODE, this option should not be used.
  redirect_uri: getRedirectUri(),
  response_type: "code",
  scope: "email openid phone profile",
  automaticSilentRenew: true,
  loadUserInfo: true,
  // Set onSigninCallback to prevent default redirect behavior
  onSigninCallback: () => {
    // The callback component will handle the redirect
    console.log("onSigninCallback called");
  },
} as AuthProviderProps;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <OidcAuthProvider {...cognitoAuthConfig}>{children}</OidcAuthProvider>;
}
