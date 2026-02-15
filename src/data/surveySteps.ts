/**
 * Step definitions for the survey - groups sections into navigable steps.
 * This is the ONLY place where step structure is defined.
 * 
 * Each step groups one or more schema sections and has:
 * - id: unique identifier
 * - title: display title
 * - description: subtitle
 * - type: 'intro' for welcome page, 'questions' for question sections
 * - sectionIds: which schema sections to render in this step
 * - visibilityFn: optional function to determine if step should be shown
 */

import { SurveyData } from "@/types/survey";

export interface SurveyStep {
  id: string;
  title: string;
  description: string;
  type: 'intro' | 'questions';
  sectionIds: string[];
  /** If defined, step is only shown when this returns true */
  isVisible?: (data: SurveyData) => boolean;
  /** If true, this step shows global data (shared across evaluations) */
  isGlobal?: boolean;
}

function getProjectFlags(data: SurveyData) {
  const projectTypes = data.projectTypes || [];
  const isGgv = projectTypes.includes('ggv') || projectTypes.includes('ggv_oder_mieterstrom');
  const isMieterstrom = projectTypes.includes('mieterstrom');
  const isES = projectTypes.includes('energysharing');
  const isGgvOrMieterstrom = isGgv || isMieterstrom;
  const onlyEnergySharing = isES && !isGgvOrMieterstrom;

  const isGgvInOperation = data.planningStatus?.includes?.('pv_laeuft_ggv_laeuft') || false;
  const isMieterstromInOperation = isMieterstrom && (
    isGgv
      ? data.mieterstromPlanningStatus?.includes?.('pv_laeuft_ggv_laeuft') || false
      : data.planningStatus?.includes?.('pv_laeuft_ggv_laeuft') || false
  );

  return { isGgv, isMieterstrom, isES, isGgvOrMieterstrom, onlyEnergySharing, isGgvInOperation, isMieterstromInOperation };
}

export const SURVEY_STEPS: SurveyStep[] = [
  {
    id: 'about',
    title: 'Über Sie',
    description: 'Einordnung & Motivation',
    type: 'questions',
    sectionIds: ['about'],
    isGlobal: true,
  },
  {
    id: 'project',
    title: 'Projekt',
    description: 'Projektdetails & VNB',
    type: 'questions',
    sectionIds: ['project'],
  },
  {
    id: 'planning-general',
    title: 'Planung: Allgemeines',
    description: 'Planungsstand & Herausforderungen',
    type: 'questions',
    sectionIds: ['planning', 'challenges'],
    isVisible: (data) => !getProjectFlags(data).onlyEnergySharing,
  },
  {
    id: 'planning-model',
    title: 'Planung: Modellspezifisch',
    description: 'Details zum gewählten Modell',
    type: 'questions',
    sectionIds: ['vnb-planning', 'vnb-msb', 'mieterstrom-planning', 'mieterstrom-vnb-offer', 'energy-sharing'],
  },
  {
    id: 'operation-model',
    title: 'Betrieb: Modellspezifisch',
    description: 'Erfahrungen im Betrieb',
    type: 'questions',
    sectionIds: ['ggv-operation', 'service-provider', 'mieterstrom-operation'],
    isVisible: (data) => {
      const flags = getProjectFlags(data);
      return !flags.onlyEnergySharing && (flags.isGgvInOperation || flags.isMieterstromInOperation);
    },
  },
  {
    id: 'final',
    title: 'Abschluss',
    description: 'Letzte Informationen',
    type: 'questions',
    sectionIds: ['final'],
    isGlobal: true,
  },
];

/**
 * Get the visible steps based on current data.
 */
export function getVisibleSteps(data: SurveyData): SurveyStep[] {
  return SURVEY_STEPS.filter(step => !step.isVisible || step.isVisible(data));
}

/**
 * Check if a step is global (shared across evaluations).
 */
export function isGlobalStep(stepId: string): boolean {
  return SURVEY_STEPS.find(s => s.id === stepId)?.isGlobal || false;
}
