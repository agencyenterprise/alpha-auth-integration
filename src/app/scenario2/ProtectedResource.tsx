"use client";

import { useState } from "react";
import { useAuth } from "react-oidc-context";

interface ProtectedResourceData {
  message: string;
  user: {
    sub: string;
    email: string;
    scopes: string[];
  };
}

function CopyableAccessToken({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 text-white font-mono text-sm mb-6">
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-400 text-xs">Original Access Token</span>
        <button
          onClick={handleCopy}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            copied
              ? "bg-green-500 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="break-all">
        <span className="opacity-75">{token}</span>
      </div>
    </div>
  );
}

export default function ProtectedResource() {
  const auth = useAuth();
  const user = auth.user;
  const userAccessToken = user?.access_token;
  const [accessToken, setAccessToken] = useState(userAccessToken);
  const [protectedResourceData, setProtectedResourceData] =
    useState<ProtectedResourceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFetchProtectedResource = async () => {
    setLoading(true);
    setError(null);
    setProtectedResourceData(null);

    try {
      const response = await fetch("/scenario2/api/getData", {
        headers: {
          Authorization: `Bearer ${accessToken || ""}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch protected resource");
      }

      setProtectedResourceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchInsufficientScopes = async () => {
    setLoading(true);
    setError(null);
    setProtectedResourceData(null);

    try {
      const response = await fetch("/scenario2/api/getData2", {
        headers: {
          Authorization: `Bearer ${accessToken || ""}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch protected resource");
      }

      setProtectedResourceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {userAccessToken && <CopyableAccessToken token={userAccessToken} />}

      <div>
        <label
          htmlFor="accessToken"
          className="block text-sm font-medium text-gray-700"
        >
          Access Token (Change Input to see validation errors)
        </label>
        <div className="bg-slate-800 rounded-lg text-white font-mono text-sm mb-6">
          <textarea
            id="accessToken"
            name="accessToken"
            rows={10}
            className="shadow-sm focus:ring-blue-500 p-4 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Paste your access token from Scenario 1 here..."
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleFetchProtectedResource}
          disabled={loading}
          className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Loading..." : "Request Protected Resource"}
        </button>

        <button
          onClick={handleFetchInsufficientScopes}
          disabled={loading}
          className={`bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Request Protected Resource with Insufficient Scopes
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {protectedResourceData && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Protected Resource Data
          </h3>
          <pre className="bg-white p-2 rounded-md text-sm overflow-x-auto">
            {JSON.stringify(protectedResourceData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
