

## Problem: Score 0 wird als "keine Daten" dargestellt

### Ursache

Die Funktion `getColor()` in `src/utils/dataLoader.ts` (Zeile 244) behandelt `score === 0` identisch mit `null/undefined`:

```typescript
if (score === null || score === undefined || Number.isNaN(score) || score === 0) 
  return 'hsl(220, 14%, 96%)'; // hellgrau = "keine Daten"
```

Das GGV-Datensheet hat fast alle VNBs mit `aggregated_score = 0`. Im GGV-Kontext bedeutet 0 aber **"Pflicht erfüllt"** — ein valider Score, kein fehlender Wert.

### Lösung

`score === 0` muss von `null` getrennt werden. Konkret:

1. **`getColor()`** — 0 bekommt eine eigene Farbe (neutrales Grau/Gelb), nur `null/undefined/NaN` bleiben "keine Daten"
2. **`getColorLabel()`** und **`getColorByIndex()`** — Legendeneinträge anpassen: 6 Kategorien statt 5 (neue Kategorie "0 / Pflicht erfüllt")
3. **`MapLegend`** — prüfen ob die Legende die neue Kategorie korrekt anzeigt

### Betroffene Dateien
- `src/utils/dataLoader.ts` — `getColor`, `getColorLabel`, `getColorByIndex`
- `src/components/MapLegend.tsx` — falls die Legendeneinträge hardcodiert sind

### Risiko
Gering. Die Änderung betrifft nur die visuelle Darstellung. Alle anderen Seiten (EHH, DdV/RoQ, EiG) nutzen entweder eigene Farbfunktionen oder haben ebenfalls das Problem, dass 0 als "keine Daten" erscheint — dort wäre die Korrektur ebenfalls sinnvoll.

