"use client";

import { AuthContextProps, useAuth } from "react-oidc-context";
import { useState, useEffect } from "react";
import { refreshTokens } from "./refreshTokenUtils";
import TokenInfo from "./TokenInfo";
import Link from "next/link";

export default function AuthComponent() {
  const auth = useAuth();
  const [showTokens, setShowTokens] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<{
    id_token?: string;
    access_token?: string;
    refresh_token?: string;
  }>({});

  // Initialize tokens from auth context when authenticated
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      setTokens({
        id_token: auth.user.id_token,
        access_token: auth.user.access_token,
        refresh_token: auth.user.refresh_token,
      });
    }
  }, [auth.isAuthenticated, auth.user]);

  const handleRefreshToken = async () => {
    // Use either the stored refresh token or the one from auth context
    const refreshToken = tokens.refresh_token || auth.user?.refresh_token;

    if (!refreshToken) {
      setRefreshError("No refresh token available");
      return;
    }

    setRefreshing(true);
    setRefreshError(null);

    try {
      const newTokens = await refreshTokens(refreshToken);

      // Update our local tokens state
      setTokens({
        id_token: newTokens.id_token,
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
      });

      setRefreshing(false);
    } catch (error) {
      setRefreshError(
        error instanceof Error ? error.message : "Failed to refresh tokens"
      );
      setRefreshing(false);
    }
  };

  if (auth.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4">Loading authentication...</p>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {auth.error.message}</span>
        </div>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return (
      <AuthenticatedContent
        tokens={tokens}
        auth={auth}
        showTokens={showTokens}
        setShowTokens={setShowTokens}
        handleRefreshToken={handleRefreshToken}
        refreshing={refreshing}
        refreshError={refreshError}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          1EdTech Platform Authentication
        </h2>
        <p className="mb-6 text-gray-600">
          Sign in to access the 1EdTech platform services and resources.
        </p>

        <button
          onClick={() => auth.signinRedirect()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition flex items-center justify-center"
        >
          <span className="mr-2">Sign in with Cognito</span>
        </button>
      </div>
    </div>
  );
}

function AuthenticatedContent({
  tokens,
  auth,
  showTokens,
  setShowTokens,
  handleRefreshToken,
  refreshing,
  refreshError,
}: {
  tokens: {
    id_token?: string;
    access_token?: string;
    refresh_token?: string;
  };
  auth: AuthContextProps;
  showTokens: boolean;
  setShowTokens: (showTokens: boolean) => void;
  handleRefreshToken: () => void;
  refreshing: boolean;
  refreshError: string | null;
}) {
  // Use either our local tokens state (for refreshed tokens) or the ones from auth
  const idToken = tokens.id_token || auth.user?.id_token;
  const accessToken = tokens.access_token || auth.user?.access_token;
  const refreshToken = tokens.refresh_token || auth.user?.refresh_token;

  return (
    <div className="flex flex-col items-center p-8 max-w-3xl mx-auto">
      <div className="w-full bg-white shadow-md rounded-lg p-6 mb-6 text-slate-600">
        <h2 className="text-2xl font-bold mb-4">Authentication Successful!</h2>
        <div className="mb-4">
          <p className="text-lg font-semibold">
            Welcome, {auth.user?.profile.name || auth.user?.profile.email}!
          </p>
          <p className="text-gray-600">
            You have successfully authenticated with Cognito.
          </p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">User Info:</h3>
          <div className="bg-gray-50 p-3 rounded-md">
            <p>
              <span className="font-medium">Email:</span>{" "}
              {auth.user?.profile.email}
            </p>
            {auth.user?.profile.phone_number && (
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {auth.user?.profile.phone_number}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowTokens(!showTokens)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
          >
            {showTokens ? "Hide Tokens" : "Show Tokens"}
          </button>

          {showTokens && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Tokens:</h3>
              <div className="space-y-4">
                {idToken && <TokenInfo token={idToken} type="id" />}

                {accessToken && <TokenInfo token={accessToken} type="access" />}

                {refreshToken && (
                  <div>
                    <p className="font-medium mb-1">Refresh Token:</p>
                    <pre className="bg-gray-100 p-2 rounded-md text-xs overflow-x-auto max-h-32 overflow-y-auto">
                      {refreshToken}
                    </pre>
                  </div>
                )}
              </div>

              {refreshToken && (
                <div className="mt-4">
                  <button
                    onClick={handleRefreshToken}
                    disabled={refreshing}
                    className={`bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition ${
                      refreshing ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {refreshing ? "Refreshing..." : "Refresh Tokens"}
                  </button>

                  {refreshError && (
                    <div className="mt-2 text-red-500 text-sm">
                      {refreshError}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={() => auth.removeUser()}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="w-full bg-white shadow-md rounded-lg p-6 mb-6 text-slate-600">
        <h2 className="text-2xl font-bold mb-4">What&apos;s Next?</h2>
        <p className="text-gray-600 mb-4">
          Now that you&apos;re authenticated, you can test the token validation
          in{" "}
          <Link
            href="/scenario2"
            className="text-blue-500 hover:text-blue-600 hover:underline"
          >
            Scenario 2
          </Link>
          . This will demonstrate how other applications can validate your
          access token and check for required scopes.
        </p>
      </div>
    </div>
  );
}
