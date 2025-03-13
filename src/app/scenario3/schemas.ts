import { z } from "zod";

export const serviceClientSchema = z.object({
  clientId: z.string().min(1, { message: "Client ID is required" }),
  clientSecret: z.string().min(1, { message: "Client Secret is required" }),
  tokenEndpoint: z
    .string()
    .url({ message: "Valid token endpoint URL is required" }),
  scopes: z
    .array(z.string())
    .min(1, { message: "At least one scope is required" }),
});

export const tokenValidationSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
  requiredScopes: z
    .array(z.string())
    .min(1, { message: "At least one scope is required" }),
});

export const formSchema = z.object({
  client1: serviceClientSchema,
  client2: serviceClientSchema,
});

export type ServiceClientFormData = z.infer<typeof serviceClientSchema>;
export type TokenValidationFormData = z.infer<typeof tokenValidationSchema>;
export type FormSchema = z.infer<typeof formSchema>;
