import type { Metadata } from "next";
import OnboardingFunnel from "@/components/funnel/OnboardingFunnel";

export const metadata: Metadata = {
  title: "Start learning Bikol",
  description: "Answer four quick questions and get your starting plan for learning Bikol.",
};

export default function StartPage() {
  return <OnboardingFunnel />;
}
