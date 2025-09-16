import type { ExplainIdentifiedDiseaseOutput } from "@/ai/flows/explain-identified-disease";
import type { SuggestNaturalCuresOutput } from "@/ai/flows/suggest-natural-cures";

export type AnalysisResult = {
  id: string;
  image: string; // base64 data URL
  disease: string;
  explanation?: ExplainIdentifiedDiseaseOutput;
  cures?: SuggestNaturalCuresOutput;
};
