"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormSchema } from "./schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ServiceClientFormProps {
  clientType: "client1" | "client2";
  onGenerateToken: (data: FormSchema) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
  token: string | null;
}

export default function ServiceClientForm({
  clientType,
  onGenerateToken,
  isGenerating,
  error,
  token,
}: ServiceClientFormProps) {
  const [newScope, setNewScope] = useState("");

  const {
    control,
    watch,
    setValue,
    handleSubmit,
  } = useFormContext<FormSchema>();

  const scopes = watch(`${clientType}.scopes`);

  const handleAddScope = () => {
    if (newScope && !scopes.includes(newScope)) {
      setValue(`${clientType}.scopes`, [...scopes, newScope], {
        shouldValidate: true,
      });
      setNewScope("");
    }
  };

  const handleRemoveScope = (scopeToRemove: string) => {
    setValue(
      `${clientType}.scopes`,
      scopes.filter((scope) => scope !== scopeToRemove),
      { shouldValidate: true }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddScope();
    }
  };

  // Determine color scheme based on client type
  const colorScheme = clientType === "client1" ? "blue" : "purple";
  const buttonVariant = clientType === "client1" ? "default" : "secondary";

  return (
    <Card className={`bg-${colorScheme}-50 border-${colorScheme}-100`}>
      <CardHeader>
        <CardTitle className={`text-${colorScheme}-900`}>
          {clientType === "client1" ? "Service Client 1" : "Service Client 2"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onGenerateToken)} className="space-y-4">
          <FormField
            control={control}
            name={`${clientType}.clientId`}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={`${clientType}-clientId`}>
                  Client ID
                </FormLabel>
                <FormControl>
                  <Input
                    id={`${clientType}-clientId`}
                    placeholder="Enter client ID"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`${clientType}.clientSecret`}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={`${clientType}-clientSecret`}>
                  Client Secret
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    id={`${clientType}-clientSecret`}
                    placeholder="Enter client secret"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`${clientType}.tokenEndpoint`}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={`${clientType}-tokenEndpoint`}>
                  Token Endpoint
                </FormLabel>
                <FormControl>
                  <Input
                    id={`${clientType}-tokenEndpoint`}
                    placeholder="Enter token endpoint URL"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`${clientType}.scopes`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scopes</FormLabel>
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {field.value.map((scope) => (
                      <Badge
                        key={scope}
                        variant="outline"
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
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </div>
                <div className="flex">
                  <Input
                    type="text"
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a scope"
                    className="rounded-r-none"
                  />
                  <Button
                    type="button"
                    onClick={handleAddScope}
                    variant={buttonVariant}
                    className="rounded-l-none"
                  >
                    Add
                  </Button>
                </div>
              </FormItem>
            )}
          />

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isGenerating}
              variant={buttonVariant}
              className="w-full"
            >
              {isGenerating ? (
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
                  Generating...
                </span>
              ) : (
                "Generate M2M Token"
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {token && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Generated Token
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(token)}
                  className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700"
                >
                  Copy
                </Button>
              </div>
              <div className="bg-gray-800 p-3 rounded-md overflow-x-auto">
                <pre className="text-green-400 text-xs whitespace-pre-wrap break-all font-mono">
                  {token}
                </pre>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
