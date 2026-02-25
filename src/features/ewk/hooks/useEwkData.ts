import { useState, useEffect, useCallback, useRef } from 'react';
import type { IndicatorMeta, VnbRow, DatasetMeta, SourceKey } from '../types';
import { SOURCE_CSV_MAP } from '../types';
import { parseCsv } from '../utils/csvParser';

const csvCache = new Map<SourceKey, VnbRow[]>();

export function useIndicatorCatalog() {
  const [catalog, setCatalog] = useState<IndicatorMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/ewk/indicator_catalog.json')
      .then((r) => r.json())
      .then((data: IndicatorMeta[]) => setCatalog(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { catalog, loading };
}

export function useDatasetMeta() {
  const [meta, setMeta] = useState<DatasetMeta | null>(null);
  useEffect(() => {
    fetch('/data/ewk/dataset_meta.json')
      .then((r) => r.json())
      .then(setMeta)
      .catch(console.error);
  }, []);
  return meta;
}

export function useBeschreibung() {
  const [text, setText] = useState('');
  useEffect(() => {
    fetch('/data/ewk/beschreibung_extract.txt')
      .then((r) => r.text())
      .then(setText)
      .catch(console.error);
  }, []);
  return text;
}

export function useCsvData(source: SourceKey | null) {
  const [data, setData] = useState<VnbRow[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (src: SourceKey) => {
    if (csvCache.has(src)) {
      setData(csvCache.get(src)!);
      return;
    }
    setLoading(true);
    try {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const resp = await fetch(SOURCE_CSV_MAP[src], { signal: ctrl.signal });
      const text = await resp.text();
      const rows = parseCsv(text);
      csvCache.set(src, rows);
      setData(rows);
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (source) load(source);
    else setData([]);
  }, [source, load]);

  return { data, loading };
}
