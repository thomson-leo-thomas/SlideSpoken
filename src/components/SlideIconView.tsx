import {
  ArrowRight, Award, BarChart3, BookOpen, Briefcase, Building2, Calendar, Camera, Car, CheckCircle, Clock,
  Cloud, Code, Cpu, Database, DollarSign, Droplet, Factory, Film, Flag, Globe, GraduationCap, Handshake,
  Heart, HelpCircle, Home, Layers, Leaf, Lightbulb, Lock, MapPin, Megaphone, MessageSquare, Music, Network,
  PieChart, Plane, Puzzle, Quote, Rocket, Search, Settings, ShieldCheck, ShoppingCart, Smartphone, Sparkles,
  Star, Stethoscope, Sun, Target, TrendingDown, TrendingUp, User, Users, Utensils, Wifi, Workflow, Wrench, Zap,
  AlertTriangle, type LucideIcon,
} from "lucide-react";
import type { SlideIcon } from "@/lib/icons";

const ICONS: Record<SlideIcon, LucideIcon> = {
  Sparkles, Lightbulb, Target, Rocket, TrendingUp, TrendingDown, BarChart3, PieChart, Users, User, Globe,
  MapPin, Leaf, Heart, ShieldCheck, Lock, Zap, Clock, Calendar, CheckCircle, AlertTriangle, HelpCircle,
  MessageSquare, Quote, BookOpen, GraduationCap, Briefcase, DollarSign, ShoppingCart, Cpu, Code, Database,
  Cloud, Smartphone, Wifi, Settings, Wrench, Layers, Workflow, Network, Flag, Award, Star, Music, Camera,
  Film, Car, Plane, Home, Building2, Factory, Sun, Droplet, Stethoscope, Utensils, Handshake, Megaphone,
  Search, Puzzle, ArrowRight,
};

export function SlideIconView({ name, className, style }: { name: SlideIcon; className?: string; style?: React.CSSProperties }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} style={style} aria-hidden />;
}
