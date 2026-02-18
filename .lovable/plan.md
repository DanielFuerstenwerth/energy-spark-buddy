

## Changelog-Eintrag duplizieren auf der Methodik-Seite

Der ausgewählte Bereich ist der Changelog-Abschnitt in `src/pages/Methodik.tsx` (Zeile 129-136). Dort ist aktuell ein einzelner Eintrag hardcoded.

### Umsetzung

In `src/pages/Methodik.tsx` wird im Changelog-Card ein neuer Eintrag oberhalb des bestehenden eingefügt mit aktuellem Datum (2026-02-18) und Platzhaltertext, den du dann anpassen kannst.

### Technische Details

- Datei: `src/pages/Methodik.tsx`, Zeilen 129-136
- Ein neues `<div>` mit Datum und Beschreibungstext wird vor dem bestehenden Eintrag eingefuegt
- Struktur ist identisch zum vorhandenen Eintrag (gleiche CSS-Klassen)

