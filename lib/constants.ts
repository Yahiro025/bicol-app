import {
  MessageCircle, Star, Users, Home, User, Heart, Utensils, Mountain,
  PawPrint, Play, Paintbrush, ListOrdered, Palette, Clock, MapPin,
  HeartPulse, Coffee, CloudSun, Shirt, GraduationCap, Microchip,
  Volleyball, Music, Plane, ShoppingCart, Smile, Briefcase,
  Theater, Church, Hammer, Car, Soup, Sprout, Box, Gavel,
  Laugh, HelpingHand, SpellCheck, BookOpen, Landmark, Lightbulb,
  CalendarDays, Bus, CloudRain, BookOpenCheck, Coins, Flame, Book, Send,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CategoryMeta {
  icon: LucideIcon;
  color: string;
}

// Canonical category entries — aliases reference the same object via aliasMap below
const _cat = (icon: LucideIcon, color: string): CategoryMeta => ({ icon, color });

const CATEGORY_ENTRIES: [string, CategoryMeta][] = [
  ["Greetings",          _cat(MessageCircle, "#D4572A")],
  ["Greeting",           _cat(MessageCircle, "#D4572A")],
  ["Basic",              _cat(Star, "#2D6A4F")],
  ["People",             _cat(Users, "#6C5CE7")],
  ["Family",             _cat(Home, "#E17055")],
  ["Body",               _cat(User, "#00B894")],
  ["Food",               _cat(Utensils, "#FDCB6E")],
  ["Nature",             _cat(Mountain, "#00B894")],
  ["Animals",            _cat(PawPrint, "#E17055")],
  ["Actions",            _cat(Play, "#0984E3")],
  ["Action",             _cat(Play, "#0984E3")],
  ["Descriptors",        _cat(Paintbrush, "#6C5CE7")],
  ["Description",        _cat(Paintbrush, "#6C5CE7")],
  ["Numbers",            _cat(ListOrdered, "#D4572A")],
  ["Colors",             _cat(Palette, "#FDCB6E")],
  ["Time",               _cat(Clock, "#0984E3")],
  ["Places",             _cat(MapPin, "#2D6A4F")],
  ["Health & Medicine",  _cat(HeartPulse, "#EB4D4B")],
  ["Daily Life",         _cat(Coffee, "#636E72")],
  ["Relationships",      _cat(Heart, "#A29BFE")],
  ["Weather",            _cat(CloudSun, "#00CEC9")],
  ["Clothing",           _cat(Shirt, "#FAB1A0")],
  ["Education",          _cat(GraduationCap, "#54A0FF")],
  ["Technology",         _cat(Microchip, "#2D3436")],
  ["Sports",             _cat(Volleyball, "#FF9F43")],
  ["Music",              _cat(Music, "#B2BEC3")],
  ["Travel",             _cat(Plane, "#74B9FF")],
  ["Shopping",           _cat(ShoppingCart, "#FFEAA7")],
  ["Emotions",           _cat(Smile, "#E84393")],
  ["Emotion",            _cat(Smile, "#E84393")],
  ["House",              _cat(Home, "#55E6C1")],
  ["Work",               _cat(Briefcase, "#95A5A6")],
  ["Culture",            _cat(Theater, "#F0932B")],
  ["Religion",           _cat(Church, "#F1C40F")],
  ["Tools",              _cat(Hammer, "#B33939")],
  ["Transportation",     _cat(Car, "#227093")],
  ["Kitchen",            _cat(Soup, "#6AB04C")],
  ["Environment",        _cat(Sprout, "#40407A")],
  ["Object",             _cat(Box, "#636E72")],
  ["Attitude",           _cat(Theater, "#F0932B")],
  ["Profession",         _cat(Briefcase, "#95A5A6")],
  ["Law",                _cat(Gavel, "#B33939")],
  ["Humor",              _cat(Laugh, "#E84393")],
  ["Charity",            _cat(HeartPulse, "#EB4D4B")],
  ["Social",             _cat(Users, "#A29BFE")],
  ["Grammar",            _cat(SpellCheck, "#54A0FF")],
  ["Location",           _cat(MapPin, "#2D6A4F")],
  ["Assistance",         _cat(HelpingHand, "#227093")],
  ["Literature",         _cat(BookOpen, "#6B6259")],
  ["History",            _cat(Landmark, "#40407A")],
  ["Realization",        _cat(Lightbulb, "#F1C40F")],
  ["Labor",              _cat(Briefcase, "#95A5A6")],
  ["Days & Time",        _cat(CalendarDays, "#0984E3")],
  ["Home & Family",      _cat(Home, "#E17055")],
  ["Travel & Transportation", _cat(Bus, "#74B9FF")],
  ["Weather & Climate",  _cat(CloudRain, "#00CEC9")],
  ["Work & School",      _cat(BookOpenCheck, "#95A5A6")],
  ["Numbers, Counting & Currency", _cat(Coins, "#2D6A4F")],
  ["Food, Drinks & Dining", _cat(Utensils, "#FDCB6E")],
  ["Emotions & Personal Traits", _cat(Smile, "#E84393")],
  ["Animals & Nature",   _cat(Sprout, "#00B894")],
  ["Food & Cooking",     _cat(Flame, "#F0932B")],
  ["Greetings & Expressions", _cat(MessageCircle, "#D4572A")],
  ["Family & Relationships", _cat(Users, "#A29BFE")],
  ["Emotions & Feelings", _cat(Heart, "#EB4D4B")],
  ["General",            _cat(Book, "#6B6259")],
];

export const CATEGORY_META: Record<string, CategoryMeta> = Object.fromEntries(CATEGORY_ENTRIES);

export const POPULAR_WORDS = [
  "Magayon", "Kumusta", "Marhay", "Dakol", "Kakanon",
  "Harong", "Tawo", "Aldaw", "Salamat", "Aram",
];

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const TENSE_LABELS: Record<string, string> = {
  infinitive: 'Infinitive',
  past: 'Past (Completed)',
  progressive: 'Progressive (Incomplete)',
  future: 'Future (Contemplated)',
};

export const TENSE_ORDER = ['infinitive', 'past', 'progressive', 'future'];

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/browse", label: "Browse", icon: BookOpen },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/flashcards", label: "Study", icon: BookOpenCheck },
  { href: "/contribute", label: "Contribute", icon: Send },
];

const ZINC_BASE = "#a1a1aa";
export const NAV_ICON_COLORS: Record<string, { base: string; active: string }> = {
  "/":           { base: ZINC_BASE, active: "#3b82f6" },
  "/browse":     { base: ZINC_BASE, active: "#10b981" },
  "/learn":      { base: ZINC_BASE, active: "#f59e0b" },
  "/flashcards": { base: ZINC_BASE, active: "#8b5cf6" },
  "/contribute": { base: ZINC_BASE, active: "#14b8a6" },
};
