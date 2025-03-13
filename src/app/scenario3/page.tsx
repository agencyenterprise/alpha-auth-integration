"use client";

import Link from "next/link";
import M2MTokenGenerator from "./M2MTokenGenerator";

export default function Scenario3() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Scenario 3: Machine-to-Machine Authentication
            </h1>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Back to Home
            </Link>
          </div>
          <p className="mt-2 text-gray-700">
            Demonstration of service-to-service authentication using OAuth 2.0
            Client Credentials flow
          </p>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Machine-to-Machine Token Playground
            </h2>
            <p className="text-gray-700 mb-6">
              This playground allows you to generate and validate OAuth 2.0
              tokens for machine-to-machine communication. Configure client
              credentials, generate tokens, and test token validation with
              required scopes.
            </p>

            <M2MTokenGenerator />
          </div>
        </div>
      </main>
    </div>
  );
}
