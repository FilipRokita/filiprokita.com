import { z } from 'astro/zod';

/**
 * The shape of one project file. `image` is the helper Astro passes to a collection
 * schema, so a cover is checked and optimized like any other image.
 */
export const projectSchema = <Image extends z.ZodType>(image: () => Image) =>
  z.object({
    title: z.string().min(1),
    /** One line, shown in the project list and under the title. */
    summary: z.string().min(1),
    /** Position in the list, from 1. */
    order: z.number().int().positive(),
    /** Takes the project off the site without deleting the file. */
    hidden: z.boolean().default(false),
    cover: image(),
    coverAlt: z.string().min(1),
    /** The mono caption under the cover. */
    coverCaption: z.string().min(1),
    links: z.object({
      /** Absent for a project that is not an app, such as a GitHub tool. */
      live: z.url().optional(),
      github: z.url(),
    }),
    stack: z.array(z.string().min(1)).min(1),
    /** The short case study: the choice and why, three to five entries. */
    decisions: z
      .array(z.object({ title: z.string().min(1), text: z.string().min(1) }))
      .min(3)
      .max(5)
      .optional(),
  });
