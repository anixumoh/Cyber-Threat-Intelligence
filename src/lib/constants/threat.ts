import { AnalysisCalcResultType } from '$lib/types/threat';

export const statusOptions = Object.entries(AnalysisCalcResultType).map(([id, text]) => ({ id, text }));

export const allStatusOptions = Object.keys(AnalysisCalcResultType);
export const defaultStatusOptions = [
  AnalysisCalcResultType.POSITIVE,
  AnalysisCalcResultType.NEGATIVE,
  AnalysisCalcResultType.INFORMATIVE
];

export function isDefaultStatusOptions(options: AnalysisCalcResultType[]) {
  if (!options.length) return true;
  return (
    options.length === defaultStatusOptions.length &&
    new Set([...options, ...defaultStatusOptions]).size === defaultStatusOptions.length
  );
}

export const defaultStatusOptions2 = [
  { id: 0, label: 'POSITIVE', analysisState: 0, selected: true },
  { id: 1, label: 'NEGATIVE', analysisState: 1, selected: true },
  { id: 2, label: 'INFORMATIVE', analysisState: 2, selected: true },
  { id: 3, label: 'NOT_IMPORTANT', analysisState: 3, selected: false }
];
