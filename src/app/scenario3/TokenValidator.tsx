"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TokenValidationFormData, tokenValidationSchema } from "./schemas";

interface TokenValidationResult {
  error?: Record<string, string>;
  message?: string;
}

interface TokenValidatorProps {
  client1Token: string | null;
  client2Token: string | null;
}

const defaultScopes = process.env.NEXT_PUBLIC_M2M_DEFAULT_SCOPES || "";

export default function TokenValidator({
  client1Token,
  client2Token,
}: TokenValidatorProps) {
  const [newScope, setNewScope] = useState<string>("");
  const [validationResult, setValidationResult] =
    useState<TokenValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TokenValidationFormData>({
    resolver: zodResolver(tokenValidationSchema),
    defaultValues: {
      token: "",
      requiredScopes: [defaultScopes],
    },
  });

  const requiredScopes = watch("requiredScopes");

  const handleAddScope = () => {
    if (newScope && !requiredScopes.includes(newScope)) {
      setValue("requiredScopes", [...requiredScopes, newScope], {
        shouldValidate: true,
      });
      setNewScope("");
    }
  };

  const handleRemoveScope = (scopeToRemove: string) => {
    setValue(
      "requiredScopes",
      requiredScopes.filter((scope) => scope !== scopeToRemove),
      { shouldValidate: true }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddScope();
    }
  };

  const handleUseToken = (token: string | null) => {
    if (token) {
      setValue("token", token, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: TokenValidationFormData) => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await fetch("/scenario3/api/validate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: data.token,
          requiredScopes: data.requiredScopes,
        }),
      });

      const responseData = await response.json();

      console.log({ responseData });

      if (!response.ok) {
        console.log("response is not okay");
        throw new Error(
          responseData.error.message || "Token validation failed"
        );
      }

      setValidationResult(responseData);
    } catch (error) {
      console.error("Error validating token:", error);
      setValidationResult({
        error: {
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        },
      });
    } finally {
      setIsValidating(false);
    }
  };

  const validationFailed = !!validationResult?.error;
  const validationSucceeded = !validationFailed && !!validationResult?.message;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label
            htmlFor="tokenInput"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Token to Validate
          </label>
          <div className="flex flex-col space-y-2">
            <textarea
              id="tokenInput"
              {...register("token")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm placeholder-gray-500"
              placeholder="Paste a token to validate"
              rows={3}
            />
            {errors.token && (
              <p className="mt-1 text-sm text-red-600">
                {errors.token.message}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {client1Token && (
                <button
                  type="button"
                  onClick={() => handleUseToken(client1Token)}
                  className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm leading-5 font-medium rounded-md text-blue-800 bg-blue-50 hover:bg-blue-100"
                >
                  Use Client 1 Token
                </button>
              )}
              {client2Token && (
                <button
                  type="button"
                  onClick={() => handleUseToken(client2Token)}
                  className="inline-flex items-center px-3 py-1 border border-purple-300 text-sm leading-5 font-medium rounded-md text-purple-800 bg-purple-50 hover:bg-purple-100"
                >
                  Use Client 2 Token
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Required Scopes for Validation
          </label>
          <Controller
            name="requiredScopes"
            control={control}
            render={({ field }) => (
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {field.value.map((scope) => (
                    <div
                      key={scope}
                      className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
                    >
                      <span className="text-gray-800">{scope}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveScope(scope)}
                        className="ml-2 text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {errors.requiredScopes && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.requiredScopes.message}
                  </p>
                )}
              </div>
            )}
          />
          <div className="flex">
            <input
              type="text"
              value={newScope}
              onChange={(e) => setNewScope(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
              placeholder="Add a required scope"
            />
            <button
              type="button"
              onClick={handleAddScope}
              className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isValidating}
            className={`w-full px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isValidating
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
            }`}
          >
            {isValidating ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Validating...
              </span>
            ) : (
              "Validate Token"
            )}
          </button>
        </div>
      </form>

      {validationResult && (
        <div
          className={`mt-4 p-4 rounded-md ${
            validationSucceeded
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <h4
            className={`text-sm font-medium mb-2 ${
              validationSucceeded ? "text-green-800" : "text-red-800"
            }`}
          >
            Validation Result
          </h4>

          {validationSucceeded ? (
            <div className="space-y-2">
              <p className="text-green-700">✓ Token is valid</p>
              <p className="text-sm text-gray-700">
                {validationResult.message}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-red-700">✗ Token is invalid</p>
              {validationResult.error && (
                <p className="text-sm text-red-600 mt-1">
                  {JSON.stringify(validationResult.error, null, 2)}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
