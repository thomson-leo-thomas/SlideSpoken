import { z } from "zod";

export const imageQuerySchema = z.string().trim().min(1).max(80);

export const slideImageSchema = z.object({
  url: z.string().url().nullable(),
  alt: z.string().optional(),
  photographer: z.string().optional(),
  photographerUrl: z.string().url().optional(),
});

export type SlideImage = z.infer<typeof slideImageSchema>;

export const NO_IMAGE: SlideImage = { url: null };

export function imageKey(slideId: string, query: string) {
  return `${slideId}::${query.trim().toLowerCase()}`;
}
