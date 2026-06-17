import { z } from "zod";

export const ClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["client", "collaborator"]).default("collaborator"),
  website: z.string().optional().default(""),
  logo: z.string().optional().default(""),
  active: z.boolean().optional().default(true),
  order: z.coerce.number().int().optional(),
});

export const ClientPatchSchema = ClientSchema.partial();

export type ClientInput = z.infer<typeof ClientSchema>;
export type ClientPatchInput = z.infer<typeof ClientPatchSchema>;
