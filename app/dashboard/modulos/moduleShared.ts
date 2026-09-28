export const ICON_OPTIONS = [
  "BookOpen", "Video", "Users", "Star", "Zap", "Globe",
  "Shield", "Award", "Calendar", "BarChart2", "Radio", "LayoutGrid",
  "Layers", "Target", "TrendingUp", "CreditCard", "MessageSquare",
  "PlayCircle", "Mic", "GraduationCap", "Briefcase", "Heart", "Code", "Home",
];

export const ROLES = [
  { key: "ADMIN", label: "Admin", color: "bg-accent-subtle text-accent border-accent/20" },
  { key: "USER", label: "Usuario", color: "bg-blue-100 text-blue-700 border-blue-200" },
];

export type PlatformSection = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  isActive: boolean;
  roles: string[];
};

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
