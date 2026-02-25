export interface IndicatorMeta {
  indicator_id: string;
  source: string;
  tab: string;
  column_key: string;
  display_label: string;
  original_header: string;
  header_row1: string;
  header_row2: string;
  cluster: string;
  data_type: 'numeric' | 'text' | 'binary_0_1';
  non_null_count: number;
}

export interface VnbRow {
  bnr: string;
  vnb_id: string;
  firmenname: string;
  bnetza_name: string;
  [key: string]: string; // c001, c002, ...
}

export interface DatasetMeta {
  source_file: string;
  sheets: Record<string, { rows: number; cols: number }>;
}

export type SourceKey =
  | 'Datensatz_EWK_2024'
  | 'Umsetzungsquote_2024'
  | 'Anschlussdauer_2024'
  | 'Digitalisierungsindex_2024';

export const SOURCE_LABELS: Record<SourceKey, string> = {
  Datensatz_EWK_2024: 'Datensatz EWK 2024',
  Umsetzungsquote_2024: 'Umsetzungsquote 2024',
  Anschlussdauer_2024: 'Anschlussdauer 2024',
  Digitalisierungsindex_2024: 'Digitalisierungsindex 2024',
};

export const SOURCE_CSV_MAP: Record<SourceKey, string> = {
  Datensatz_EWK_2024: '/data/ewk/datensatz_ewk_2024.csv',
  Umsetzungsquote_2024: '/data/ewk/umsetzungsquote_2024.csv',
  Anschlussdauer_2024: '/data/ewk/anschlussdauer_2024.csv',
  Digitalisierungsindex_2024: '/data/ewk/digitalisierungsindex_2024.csv',
};

/** Recommended indicators for the default "Empfohlen" section */
export const RECOMMENDED_INDICATORS: string[] = [
  'Anschlussdauer_2024:c003', // Anschlussdauer der EE-Anlagen NS
  'Anschlussdauer_2024:c006', // Anschlussdauer der EE-Anlagen MS
  'Anschlussdauer_2024:c009', // Anschlussdauer der EE-Anlagen HS
  'Anschlussdauer_2024:c012', // Anschlussdauer der Verbrauchseinrichtungen und Speicher NS
  'Anschlussdauer_2024:c015', // Anschlussdauer der Verbrauchseinrichtungen und Speicher MS
  'Anschlussdauer_2024:c018', // Anschlussdauer der Verbrauchseinrichtungen und Speicher HS
  'Digitalisierungsindex_2024:c001', // Gesamtscore
  'Digitalisierungsindex_2024:c003', // Digitale Prozesse und Systeme
  'Digitalisierungsindex_2024:c005', // Kunden-management
  'Digitalisierungsindex_2024:c019', // Kundenmanagement | Webportale
];
