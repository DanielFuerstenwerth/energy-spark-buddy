import { SurveyData } from "@/types/survey";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";

const ACTOR_OPTIONS = [
  { value: "buergerenergie", label: "Bürgerenergiegenossenschaft", hasTextField: true, textFieldLabel: "Name der Genossenschaft (optional)" },
  { value: "weg", label: "Wohnungseigentümergemeinschaft" },
  { value: "vermieter_privat", label: "Vermieter/in - Privatperson" },
  { value: "vermieter_prof_klein", label: "Vermieter/in - Professionell (<100 Einheiten)" },
  { value: "vermieter_wohnungsunternehmen", label: "Vermieter/in - Wohnungsunternehmen (>100 Einheiten)" },
  { value: "kommune", label: "Kommune / kommunales Unternehmen" },
  { value: "kmu", label: "Kleine und Mittelständische Unternehmen (KMU)" },
  { value: "dienstleister", label: "Dienstleister für GGV/Mieterstrom/Energy Sharing", hasTextField: true, textFieldLabel: "Welche Dienstleistung?" },
  { value: "installateur", label: "Installateur von PV-Anlagen" },
  { value: "msb", label: "Wettbewerblicher Messstellenbetreiber" },
  { value: "stadtwerk", label: "Stadtwerk/EVU" },
  { value: "andere", label: "Andere", hasTextField: true, textFieldLabel: "Bitte beschreiben" },
];

const MOTIVATION_OPTIONS = [
  { value: "pv_nutzung", label: "Wir werden auf jeden Fall eine PV-Anlage bauen (oder haben diese schon gebaut) und möchten den Strom vor Ort nutzen" },
  { value: "energiewende", label: "Wir möchten gerne Energiewende vor Ort umsetzen - sobald die Nutzung geklärt ist, kommt die PV-Anlage" },
  { value: "geschaeft", label: "Der Bau und Betrieb von PV-Anlagen ist ein wesentliches Anliegen von unserem Unternehmen" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const PROJECT_TYPE_OPTIONS = [
  { value: "ggv", label: "GGV (Gemeinschaftliche Gebäudeversorgung)" },
  { value: "mieterstrom", label: "Mieterstrom" },
  { value: "ggv_oder_mieterstrom", label: "Entweder GGV oder Mieterstrom" },
  { value: "energysharing", label: "Energy Sharing (in Zukunft möglich)" },
];

interface StepAboutYouProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepAboutYou({ data, updateData }: StepAboutYouProps) {
  return (
    <div className="space-y-8">
      <MultiSelectQuestion
        id="actor-types"
        label="A1. In welche Akteursgruppe fallen Sie?"
        description="Mehrfachauswahl möglich"
        options={ACTOR_OPTIONS}
        value={data.actorTypes}
        optionTextValues={data.actorTextFields}
        onChange={(val) => updateData("actorTypes", val)}
        onOptionTextChange={(optVal, text) => updateData("actorTextFields", { ...data.actorTextFields, [optVal]: text })}
        optional
      />

      <MultiSelectQuestion
        id="motivation"
        label="A2. Wie würden Sie Ihre Motivation einordnen?"
        description="Mehrfachauswahl möglich"
        options={MOTIVATION_OPTIONS}
        value={data.motivation}
        otherValue={data.motivationOther}
        onChange={(val) => updateData("motivation", val)}
        onOtherChange={(val) => updateData("motivationOther", val)}
      />

      <MultiSelectQuestion
        id="project-types"
        label="A3. Welche Art von Projekt möchten Sie gerne umsetzen / haben Sie umgesetzt?"
        description="Mehrfachauswahl möglich"
        options={PROJECT_TYPE_OPTIONS}
        value={data.projectTypes}
        onChange={(val) => updateData("projectTypes", val)}
      />

      <TextQuestion
        id="contact-email"
        label="Falls wir Sie bei Rückfragen kontaktieren dürfen, lassen Sie gerne eine E-Mail da"
        type="email"
        value={data.contactEmail}
        onChange={(val) => updateData("contactEmail", val)}
        placeholder="ihre@email.de"
        optional
      />
    </div>
  );
}
