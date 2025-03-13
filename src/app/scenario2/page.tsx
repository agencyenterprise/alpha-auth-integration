"use client";

import Link from "next/link";
import ProtectedResource from "./ProtectedResource";
import { useAuth } from "react-oidc-context";

export default function Scenario2() {
  const auth = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Scenario 2: Application Authentication of Users
            </h1>
            <Link
              href="/"
              className="text-blue-500 hover:text-blue-600 hover:underline"
            >
              Back to Home
            </Link>
          </div>
          <p className="mt-2 text-gray-600">
            Demonstration of how applications can validate user tokens and
            perform authorization
          </p>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {auth.isLoading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4">Loading authentication...</p>
            </div>
          ) : (
            <>
              <div className="bg-white shadow-md rounded-lg p-6 text-slate-600">
                <h2 className="text-xl font-semibold mb-4">
                  Protected Resource Demo
                </h2>
                <p className="text-gray-600 mb-6">
                  This demo shows how an application can validate user tokens
                  from Scenario 1 and check for required scopes. First
                  authenticate in{" "}
                  <Link
                    href="/scenario1"
                    className="text-blue-500 hover:text-blue-600 hover:underline"
                  >
                    Scenario 1
                  </Link>
                  , then come back here to test the protected resource.
                </p>
                {auth.user ? (
                  <ProtectedResource />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8">
                    <p className="text-gray-600">
                      Please authenticate in Scenario 1 first.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
