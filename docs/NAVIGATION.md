# Navigation Implementierung

## Audit-Report

### Ist-Probleme (vor Refactoring):
1. ❌ Custom-CSS-Dropdown mit `:hover` → kein Fokus-Management, keine ARIA-Controls
2. ❌ `<a href>` statt `<Link>` → Full-Page-Reloads
3. ❌ Eigene Collapse-Logik für Mobile → instabil, kein Standard-Pattern
4. ❌ Keine standardisierten Shadcn-Komponenten
5. ❌ Body-Scroll und ESC-Handling manuell implementiert

### Lösung (nach Refactoring):
✅ **Desktop:** `NavigationMenu` (Shadcn/Radix)
  - Automatisches Fokus-Management
  - ARIA-Attribute korrekt gesetzt
  - Hover + Fokus öffnen Dropdown
  - Alle 3 Ebenen (Kategorie → Unterkategorie → Kriterium) klickbar

✅ **Mobile:** `Sheet` + `Accordion` (Shadcn/Radix)
  - Body-Scroll-Lock automatisch
  - ESC schließt Drawer automatisch
  - Verschachtelte Accordions für Unterkategorien & Kriterien
  - Alle Links klickbar

✅ **Links:** react-router-dom `Link` überall (keine Full-Page-Reloads)

✅ **URLs:** `encodeURIComponent` für Kriterien-Slugs (z.B. "Modul1&2")

## Architektur

### Datenfluss
```
/public/data/nav.json
    ↓
lib/nav.ts (loadNavJson, buildNavItems)
    ↓
lib/links.ts (urlFor mit encodeURIComponent)
    ↓
components/NavWrapper.tsx (lädt Daten)
    ↓
components/Nav.tsx (rendert mit Shadcn-Komponenten)
```

### Link-Schema
- Kategorie: `/<cat>`
- Unterkategorie: `/<cat>/<sub>`
- Kriterium: `/<cat>/<sub>/<encodedCrit>`

Beispiel:
```
/EHH
/EHH/zvNE
/EHH/zvNE/Modul1%262  (für "Modul1&2")
```

## Geänderte Dateien

### Core-Dateien (DO NOT MODIFY):
- `src/lib/links.ts` - URL-Generierung mit Slug-Encoding
- `src/lib/nav.ts` - Daten-Loading und Struktur-Mapping
- `src/components/Nav.tsx` - Navigation mit Standard-Komponenten

### Wrapper:
- `src/components/NavWrapper.tsx` - Lädt Nav-Daten, zeigt Loading-State

## Verwendete Shadcn-Komponenten

### Desktop:
- `NavigationMenu` - Hauptcontainer
- `NavigationMenuList` - Liste der Nav-Items
- `NavigationMenuItem` - Einzelnes Item
- `NavigationMenuTrigger` - Button mit Dropdown
- `NavigationMenuContent` - Dropdown-Content
- `NavigationMenuLink` - Klickbare Links

### Mobile:
- `Sheet` - Off-Canvas-Drawer (Body-Scroll-Lock, ESC, Overlay)
- `SheetTrigger` - Hamburger-Button
- `SheetContent` - Drawer-Inhalt
- `Accordion` - Verschachtelte Collapses
- `AccordionItem` / `AccordionTrigger` / `AccordionContent`

## QA-Matrix Status

✅ **Desktop (≥1024px)**
  - Hover öffnet Dropdown
  - Fokus öffnet Dropdown
  - Alle 3 Ebenen klickbar
  - Keine Layout-Shifts

✅ **Mobile (≤768px)**
  - Hamburger → Off-Canvas
  - Kategorie → Unterkategorie → Kriterien einklappbar
  - Alle Links klickbar
  - Body-Scroll-Lock aktiv
  - ESC schließt Drawer

✅ **Keyboard-Navigation**
  - Tab/Shift+Tab navigierbar
  - `aria-expanded` korrekt
  - Fokus sichtbar

✅ **URLs**
  - Slugs sicher encodiert
  - react-router-dom Links (keine Reloads)

✅ **Performance**
  - Keine zusätzlichen Layout-Shifts
  - Standard-Komponenten (optimiert)
  - CSS/JS minimal

## nav.json Mapping

Die `nav.json` hat folgende Struktur:
```json
{
  "kategorien": [
    {
      "slug": "EHH",
      "title": "Elektrifizierung der Haushalte",
      "tabs": ["Performance VNB", "Best Practices"],
      "unterkategorien": [
        {
          "slug": "zvNE",
          "title": "zeitvariable Netzentgelte",
          "kriterien": [
            {
              "slug": "Modul1&2",
              "title": "Modul 1&2 wird angeboten und abgerechnet"
            }
          ]
        }
      ]
    }
  ]
}
```

Wird gemappt zu:
```typescript
{
  label: "Elektrifizierung der Haushalte",
  href: "/EHH",
  sections: [
    {
      label: "zeitvariable Netzentgelte",
      href: "/EHH/zvNE",
      items: [
        {
          label: "Modul 1&2 wird angeboten und abgerechnet",
          href: "/EHH/zvNE/Modul1%262"
        }
      ]
    }
  ]
}
```

## Constraints & Best Practices

### DO NOT MODIFY:
- `src/lib/links.ts`
- `src/lib/nav.ts`
- `src/components/Nav.tsx`

Diese Dateien sind stabil und sollten nicht automatisch refactored werden.

### Theme/Tokens:
- Verwendet bestehende Design-Tokens aus `index.css`
- `--background`, `--foreground`, `--border`, `--accent`, etc.
- Keine Hard-Coded-Farben

### Performance:
- Keine zusätzlichen Animation-Libs
- Übergänge ≤200ms
- Standard-Shadcn-Komponenten (bereits optimiert)

## Maintenance

### nav.json ändern:
1. Datei unter `/public/data/nav.json` editieren
2. Cache löschen (falls nötig)
3. Navigation lädt neue Struktur automatisch

### Neue Links hinzufügen:
Hardcoded-Links (News, Methodik, etc.) in `src/lib/nav.ts`:
```typescript
return [
  { label: "News", href: "/news" },
  { label: "Methodik", href: "/methodik" },
  // ... weitere statische Links
  ...catItems // Aus nav.json generiert
];
```

### Styles anpassen:
Design-Tokens in `src/index.css` ändern, nicht direkt in Komponenten.
