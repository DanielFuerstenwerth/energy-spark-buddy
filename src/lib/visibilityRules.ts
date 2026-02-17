/**
 * Structured Visibility Rules for the Survey System
 * 
 * Replaces free-text visibilityLogic strings with type-safe, machine-readable rules.
 * A generic evaluateRule() engine evaluates any rule against SurveyData.
 */

import type { SurveyData } from '@/types/survey';

// === Rule Types ===

export type VisibilityRule =
  | { field: string; op: 'equals'; value: string }
  | { field: string; op: 'equalsAny'; values: string[] }
  | { field: string; op: 'includes'; value: string }       // for array fields (multi-select)
  | { field: string; op: 'includesAny'; values: string[] }  // for array fields
  | { field: string; op: 'filled' }
  | { op: 'and'; rules: VisibilityRule[] }
  | { op: 'or'; rules: VisibilityRule[] }
  | { op: 'not'; rule: VisibilityRule };

// === Generic Rule Engine ===

function getFieldValue(data: SurveyData, field: string): unknown {
  return (data as unknown as Record<string, unknown>)[field];
}

export function evaluateRule(rule: VisibilityRule, data: SurveyData): boolean {
  // Compound operators
  if ('rules' in rule) {
    if (rule.op === 'and') return rule.rules.every(r => evaluateRule(r, data));
    if (rule.op === 'or') return rule.rules.some(r => evaluateRule(r, data));
  }
  if (rule.op === 'not') return !evaluateRule(rule.rule, data);

  // Field-based operators
  const val = getFieldValue(data, rule.field);

  switch (rule.op) {
    case 'equals':
      return val === rule.value;

    case 'equalsAny':
      return typeof val === 'string' && rule.values.includes(val);

    case 'includes':
      // Array field contains value
      return Array.isArray(val) && val.includes(rule.value);

    case 'includesAny':
      // Array field contains at least one of the values
      return Array.isArray(val) && rule.values.some(v => val.includes(v));

    case 'filled':
      if (val === undefined || val === null || val === '') return false;
      if (Array.isArray(val)) return val.length > 0;
      return true;

    default:
      return true;
  }
}

// === Shorthand Helpers for Schema Definitions ===
// These make the schema much more readable

/** projectTypes includes 'ggv' or 'ggv_oder_mieterstrom' */
export const PT_GGV = (): VisibilityRule => ({
  field: 'projectTypes', op: 'includesAny', values: ['ggv', 'ggv_oder_mieterstrom']
});

/** projectTypes includes 'mieterstrom' */
export const PT_MS = (): VisibilityRule => ({
  field: 'projectTypes', op: 'includes', value: 'mieterstrom'
});

/** projectTypes includes 'mieterstrom' or 'ggv_oder_mieterstrom' */
export const PT_MS_OR_BOTH = (): VisibilityRule => ({
  field: 'projectTypes', op: 'includesAny', values: ['mieterstrom', 'ggv_oder_mieterstrom']
});

/** projectTypes includes any of ggv, mieterstrom, ggv_oder_mieterstrom */
export const PT_GGV_OR_MS = (): VisibilityRule => ({
  field: 'projectTypes', op: 'includesAny', values: ['ggv', 'mieterstrom', 'ggv_oder_mieterstrom']
});

/** projectTypes includes 'energysharing' */
export const PT_ES = (): VisibilityRule => ({
  field: 'projectTypes', op: 'includes', value: 'energysharing'
});

/** field equals value */
export const eq = (field: string, value: string): VisibilityRule => ({
  field, op: 'equals', value
});

/** field equals any of values */
export const eqAny = (field: string, values: string[]): VisibilityRule => ({
  field, op: 'equalsAny', values
});

/** array field includes value */
export const inc = (field: string, value: string): VisibilityRule => ({
  field, op: 'includes', value
});

/** field is filled (not empty/null/undefined) */
export const filled = (field: string): VisibilityRule => ({
  field, op: 'filled'
});

/** All rules must be true */
export const and = (...rules: VisibilityRule[]): VisibilityRule => ({
  op: 'and', rules
});

/** At least one rule must be true */
export const or = (...rules: VisibilityRule[]): VisibilityRule => ({
  op: 'or', rules
});

/** Negate a rule */
export const not = (rule: VisibilityRule): VisibilityRule => ({
  op: 'not', rule
});

// === Derived Project Flags (replaces getProjectFlags duplication) ===

export interface ProjectFlags {
  isGgv: boolean;
  isMieterstrom: boolean;
  isES: boolean;
  isGgvOrMieterstrom: boolean;
  onlyEnergySharing: boolean;
  isGgvInOperation: boolean;
  isMieterstromInOperation: boolean;
}

export function getProjectFlags(data: SurveyData): ProjectFlags {
  const projectTypes = data.projectTypes || [];
  const isGgv = projectTypes.includes('ggv') || projectTypes.includes('ggv_oder_mieterstrom');
  const isMieterstrom = projectTypes.includes('mieterstrom');
  const isES = projectTypes.includes('energysharing');
  const isGgvOrMieterstrom = isGgv || isMieterstrom;
  const onlyEnergySharing = isES && !isGgvOrMieterstrom;

  const isGgvInOperation = isGgv && (data.planningStatus?.includes?.('pv_laeuft_ggv_laeuft') || false);
  const isMieterstromInOperation = isMieterstrom && (
    isGgv
      ? data.mieterstromPlanningStatus?.includes?.('pv_laeuft_ggv_laeuft') || false
      : data.planningStatus?.includes?.('pv_laeuft_ggv_laeuft') || false
  );

  return { isGgv, isMieterstrom, isES, isGgvOrMieterstrom, onlyEnergySharing, isGgvInOperation, isMieterstromInOperation };
}

// === Pre-built complex rules for reuse ===

/** GGV is in operation (planningStatus includes 'pv_laeuft_ggv_laeuft' AND project is GGV) */
export const GGV_IN_OPERATION = (): VisibilityRule => and(PT_GGV(), inc('planningStatus', 'pv_laeuft_ggv_laeuft'));

/** Mieterstrom is in operation - complex: depends on whether GGV is also selected */
export const MS_IN_OPERATION = (): VisibilityRule => and(
  PT_MS(),
  or(
    inc('mieterstromPlanningStatus', 'pv_laeuft_ggv_laeuft'),
    and(
      not(PT_GGV()),
      inc('planningStatus', 'pv_laeuft_ggv_laeuft')
    )
  )
);

/** esStatus includes 'in_betrieb' (either variant) - esStatus is stored as text[] */
export const ES_IN_OPERATION = (): VisibilityRule => ({
  field: 'esStatus', op: 'includesAny', values: ['in_betrieb_vollversorgung', 'in_betrieb_42c']
});

/** At least one selected GGV/MS model is still in planning (not in operation) */
export const AT_LEAST_ONE_IN_PLANNING = (): VisibilityRule => or(
  and(PT_GGV(), not(GGV_IN_OPERATION())),
  and(PT_MS_OR_BOTH(), not(MS_IN_OPERATION()))
);
