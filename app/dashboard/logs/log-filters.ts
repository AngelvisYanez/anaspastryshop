import { dateBounds, type DateRange } from "../data-view/filters";

export function logFilters(search: string, action: string, range: DateRange) {
  return {
    ...(search ? {
      user: {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      },
    } : {}),
    ...(action ? { action } : {}),
    createdAt: dateBounds(range),
  };
}
