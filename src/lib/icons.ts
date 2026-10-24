export const SLIDE_ICONS = [
  "Sparkles", "Lightbulb", "Target", "Rocket", "TrendingUp", "TrendingDown", "BarChart3", "PieChart",
  "Users", "User", "Globe", "MapPin", "Leaf", "Heart", "ShieldCheck", "Lock", "Zap", "Clock",
  "Calendar", "CheckCircle", "AlertTriangle", "HelpCircle", "MessageSquare", "Quote", "BookOpen",
  "GraduationCap", "Briefcase", "DollarSign", "ShoppingCart", "Cpu", "Code", "Database", "Cloud",
  "Smartphone", "Wifi", "Settings", "Wrench", "Layers", "Workflow", "Network", "Flag", "Award",
  "Star", "Music", "Camera", "Film", "Car", "Plane", "Home", "Building2", "Factory", "Sun", "Droplet",
  "Stethoscope", "Utensils", "Handshake", "Megaphone", "Search", "Puzzle", "ArrowRight",
] as const;

export type SlideIcon = (typeof SLIDE_ICONS)[number];

export const DEFAULT_ICON: SlideIcon = "Sparkles";

export function toSlideIcon(name: string | undefined | null): SlideIcon {
  if (!name) return DEFAULT_ICON;
  const exact = SLIDE_ICONS.find((i) => i === name);
  if (exact) return exact;
  const normalized = name.replace(/[-_\s]/g, "").toLowerCase();
  return SLIDE_ICONS.find((i) => i.toLowerCase() === normalized) ?? DEFAULT_ICON;
}
