"use client";

import { useState } from "react";
import TokenValidator from "./TokenValidator";

import ServiceClientForm from "./ServiceClientForm";
import { formSchema, ServiceClientFormData, FormSchema } from "./schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

const tokenEndpoint = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/token`;

const client1Scopes = (process.env.NEXT_PUBLIC_CLIENT1_SCOPES || "")
  .split(" ")
  .map((scope) => scope.trim());

const client2Scopes = (process.env.NEXT_PUBLIC_CLIENT2_SCOPES || "")
  .split(" ")
  .map((scope) => scope.trim());

// Default values from environment variables
const client1DefaultValues: ServiceClientFormData = {
  clientId: process.env.NEXT_PUBLIC_CLIENT1_ID || "",
  clientSecret: process.env.NEXT_PUBLIC_CLIENT1_SECRET || "",
  tokenEndpoint: tokenEndpoint,
  scopes: client1Scopes,
};

const client2DefaultValues: ServiceClientFormData = {
  clientId: process.env.NEXT_PUBLIC_CLIENT2_ID || "",
  clientSecret: process.env.NEXT_PUBLIC_CLIENT2_SECRET || "",
  tokenEndpoint: tokenEndpoint,
  scopes: client2Scopes,
};

export default function M2MTokenGenerator() {
  const [client1Token, setClient1Token] = useState<string | null>(null);
  const [client2Token, setClient2Token] = useState<string | null>(null);
  const [isGeneratingClient1, setIsGeneratingClient1] = useState(false);
  const [isGeneratingClient2, setIsGeneratingClient2] = useState(false);
  const [client1Error, setClient1Error] = useState<string | null>(null);
  const [client2Error, setClient2Error] = useState<string | null>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client1: client1DefaultValues,
      client2: client2DefaultValues,
    },
  });

  const generateClient1Token = async (data: FormSchema) => {
    await generateToken(
      data.client1,
      setClient1Token,
      setIsGeneratingClient1,
      setClient1Error
    );
  };

  const generateClient2Token = async (data: FormSchema) => {
    await generateToken(
      data.client2,
      setClient2Token,
      setIsGeneratingClient2,
      setClient2Error
    );
  };

  const generateToken = async (
    clientConfig: ServiceClientFormData,
    setToken: (token: string | null) => void,
    setIsGenerating: (isGenerating: boolean) => void,
    setError: (error: string | null) => void
  ) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/scenario3/api/generate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: clientConfig.clientId,
          clientSecret: clientConfig.clientSecret,
          tokenEndpoint: clientConfig.tokenEndpoint,
          scopes: clientConfig.scopes.join(" "),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const data = await response.json();
      setToken(data.access_token);
    } catch (error) {
      console.error("Error generating token:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Form {...form}>
          {/* Client 1 Configuration */}
          <ServiceClientForm
            clientType="client1"
            onGenerateToken={generateClient1Token}
            isGenerating={isGeneratingClient1}
            error={client1Error}
            token={client1Token}
          />

          {/* Client 2 Configuration */}
          <ServiceClientForm
            clientType="client2"
            onGenerateToken={generateClient2Token}
            isGenerating={isGeneratingClient2}
            error={client2Error}
            token={client2Token}
          />
        </Form>
      </div>

      {/* Token Validator Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Token Validation (Receiving Service)
        </h3>
        <TokenValidator
          client1Token={client1Token}
          client2Token={client2Token}
        />
      </div>
    </div>
  );
}
