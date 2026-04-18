import { z } from "zod";

export const edgeOptionsSchema = z.object({
  edgeId: z.string(),
  label: z.string().optional(),
  type: z.enum([
    "customStraight",
    "customStepSharp",
    "customStepRounded",
    "customBezier",
  ]),
  animated: z.boolean(),
  color: z.enum([
    "PURPLE",
    "RED",
    "GREEN",
    "BLUE",
    "PINK",
    "YELLOW",
    "ORANGE",
    "CYAN",
    "LIME",
    "EMERALD",
    "INDIGO",
    "FUCHSIA",
    "DEFAULT",
  ]),
});

export type EdgeOptionsSchema = z.infer<typeof edgeOptionsSchema>;
