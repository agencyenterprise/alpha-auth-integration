"use client";

import AuthComponent from "./AuthComponent";
import Link from "next/link";

export default function Scenario1() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Scenario 1: User Authentication
            </h1>
            <Link
              href="/"
              className="text-blue-500 hover:text-blue-600 hover:underline"
            >
              Back to Home
            </Link>
          </div>
          <p className="mt-2 text-gray-600">
            Demonstration of SSO-like experience using AWS Cognito User Pools
          </p>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <AuthComponent />
        </div>
      </main>
    </div>
  );
}
