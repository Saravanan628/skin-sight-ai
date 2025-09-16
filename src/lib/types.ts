export type AnalysisResult = {
  disease: string;
  explanation: string;
  cures: string[];
};

export type HistoryItem = {
  id: string;
  image: string; // base64 data URL
  date: string;
  result: AnalysisResult;
};
