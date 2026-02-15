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
import { getProjectFlags } from "@/lib/visibilityRules";

export interface SurveyStep {
  id: string;
  title: string;
  description: string;
  type: 'intro' | 'questions';
  sectionIds: string[];
  isVisible?: (data: SurveyData) => boolean;
  isGlobal?: boolean;
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
    isVisible: (data) => {
      const flags = getProjectFlags(data);
      return flags.isGgvOrMieterstrom;
    },
  },
  {
    id: 'planning-model',
    title: 'Planung: Modellspezifisch',
    description: 'Details zum gewählten Modell',
    type: 'questions',
    sectionIds: ['vnb-planning', 'vnb-msb', 'mieterstrom-planning', 'mieterstrom-vnb-offer', 'energy-sharing'],
    isVisible: (data) => {
      const projectTypes = data.projectTypes || [];
      return projectTypes.length > 0;
    },
  },
  {
    id: 'operation-model',
    title: 'Betrieb: Modellspezifisch',
    description: 'Erfahrungen im Betrieb',
    type: 'questions',
    sectionIds: ['ggv-operation', 'service-provider', 'mieterstrom-operation'],
    isVisible: (data) => {
      const flags = getProjectFlags(data);
      return flags.isGgvOrMieterstrom && (flags.isGgvInOperation || flags.isMieterstromInOperation);
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
