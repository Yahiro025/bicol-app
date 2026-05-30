import { 
  MessageCircle, Star, Users, Home, User, Heart, Utensils, Mountain, 
  PawPrint, Play, Paintbrush, ListOrdered, Palette, Clock, MapPin, 
  HeartPulse, Coffee, CloudSun, Shirt, GraduationCap, Microchip, 
  Volleyball, Music, Plane, ShoppingCart, Smile, Briefcase, 
  Theater, Church, Hammer, Car, Soup, Sprout, Box, Gavel, 
  Laugh, HelpingHand, SpellCheck, BookOpen, Landmark, Lightbulb, 
  CalendarDays, Bus, CloudRain, BookOpenCheck, Coins, Flame, 
  Book, Send
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CategoryMeta {
  icon: LucideIcon;
  color: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  "Greetings": { icon: MessageCircle, color: "#D4572A" },
  "Greeting": { icon: MessageCircle, color: "#D4572A" },
  "Basic": { icon: Star, color: "#2D6A4F" },
  "People": { icon: Users, color: "#6C5CE7" },
  "Family": { icon: Home, color: "#E17055" },
  "Body": { icon: User, color: "#00B894" },
  "Food": { icon: Utensils, color: "#FDCB6E" },
  "Nature": { icon: Mountain, color: "#00B894" },
  "Animals": { icon: PawPrint, color: "#E17055" },
  "Actions": { icon: Play, color: "#0984E3" },
  "Action": { icon: Play, color: "#0984E3" },
  "Descriptors": { icon: Paintbrush, color: "#6C5CE7" },
  "Description": { icon: Paintbrush, color: "#6C5CE7" },
  "Numbers": { icon: ListOrdered, color: "#D4572A" },
  "Colors": { icon: Palette, color: "#FDCB6E" },
  "Time": { icon: Clock, color: "#0984E3" },
  "Places": { icon: MapPin, color: "#2D6A4F" },
  "Health & Medicine": { icon: HeartPulse, color: "#EB4D4B" },
  "Daily Life": { icon: Coffee, color: "#636E72" },
  "Relationships": { icon: Heart, color: "#A29BFE" },
  "Weather": { icon: CloudSun, color: "#00CEC9" },
  "Clothing": { icon: Shirt, color: "#FAB1A0" },
  "Education": { icon: GraduationCap, color: "#54A0FF" },
  "Technology": { icon: Microchip, color: "#2D3436" },
  "Sports": { icon: Volleyball, color: "#FF9F43" },
  "Music": { icon: Music, color: "#B2BEC3" },
  "Travel": { icon: Plane, color: "#74B9FF" },
  "Shopping": { icon: ShoppingCart, color: "#FFEAA7" },
  "Emotions": { icon: Smile, color: "#E84393" },
  "Emotion": { icon: Smile, color: "#E84393" },
  "House": { icon: Home, color: "#55E6C1" },
  "Work": { icon: Briefcase, color: "#95A5A6" },
  "Culture": { icon: Theater, color: "#F0932B" },
  "Religion": { icon: Church, color: "#F1C40F" },
  "Tools": { icon: Hammer, color: "#B33939" },
  "Transportation": { icon: Car, color: "#227093" },
  "Kitchen": { icon: Soup, color: "#6AB04C" },
  "Environment": { icon: Sprout, color: "#40407A" },
  "Object": { icon: Box, color: "#636E72" },
  "Attitude": { icon: Theater, color: "#F0932B" },
  "Profession": { icon: Briefcase, color: "#95A5A6" },
  "Law": { icon: Gavel, color: "#B33939" },
  "Humor": { icon: Laugh, color: "#E84393" },
  "Charity": { icon: HeartPulse, color: "#EB4D4B" },
  "Social": { icon: Users, color: "#A29BFE" },
  "Grammar": { icon: SpellCheck, color: "#54A0FF" },
  "Location": { icon: MapPin, color: "#2D6A4F" },
  "Assistance": { icon: HelpingHand, color: "#227093" },
  "Literature": { icon: BookOpen, color: "#6B6259" },
  "History": { icon: Landmark, color: "#40407A" },
  "Realization": { icon: Lightbulb, color: "#F1C40F" },
  "Labor": { icon: Briefcase, color: "#95A5A6" },
  "Days & Time": { icon: CalendarDays, color: "#0984E3" },
  "Home & Family": { icon: Home, color: "#E17055" },
  "Travel & Transportation": { icon: Bus, color: "#74B9FF" },
  "Weather & Climate": { icon: CloudRain, color: "#00CEC9" },
  "Work & School": { icon: BookOpenCheck, color: "#95A5A6" },
  "Numbers, Counting & Currency": { icon: Coins, color: "#2D6A4F" },
  "Food, Drinks & Dining": { icon: Utensils, color: "#FDCB6E" },
  "Emotions & Personal Traits": { icon: Smile, color: "#E84393" },
  "Animals & Nature": { icon: Sprout, color: "#00B894" },
  "Food & Cooking": { icon: Flame, color: "#F0932B" },
  "Greetings & Expressions": { icon: MessageCircle, color: "#D4572A" },
  "Family & Relationships": { icon: Users, color: "#A29BFE" },
  "Emotions & Feelings": { icon: Heart, color: "#EB4D4B" },
  "General": { icon: Book, color: "#6B6259" }
};

export const POPULAR_WORDS = [
  "Magayon", "Kumusta", "Marhay", "Dakol", "Kakanon", 
  "Harong", "Tawo", "Aldaw", "Salamat", "Aram"
];

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Bikol verb conjugation tense labels for UI display */
export const TENSE_LABELS: Record<string, string> = {
  infinitive: 'Infinitive',
  past: 'Past (Completed)',
  progressive: 'Progressive (Incomplete)',
  future: 'Future (Contemplated)',
};

/** Display order for conjugation tenses */
export const TENSE_ORDER = ['infinitive', 'past', 'progressive', 'future'];

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/browse", label: "Browse", icon: BookOpen },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/flashcards", label: "Study", icon: BookOpenCheck },
  { href: "/contribute", label: "Contribute", icon: Send },
];

export const NAV_ICON_COLORS: Record<string, { base: string; active: string }> = {
  "/":           { base: "#a1a1aa", active: "#3b82f6" }, // blue-500
  "/browse":     { base: "#a1a1aa", active: "#10b981" }, // emerald-500
  "/learn":      { base: "#a1a1aa", active: "#f59e0b" }, // amber-500
  "/flashcards": { base: "#a1a1aa", active: "#8b5cf6" }, // violet-500
  "/contribute": { base: "#a1a1aa", active: "#14b8a6" }, // teal-500
};
