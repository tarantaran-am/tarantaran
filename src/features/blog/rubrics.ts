export const RUBRICS = ["vendors", "planning", "traditions"] as const;
export type Rubric = (typeof RUBRICS)[number];

export function isRubric(value: unknown): value is Rubric {
  return typeof value === "string" && (RUBRICS as readonly string[]).includes(value);
}
