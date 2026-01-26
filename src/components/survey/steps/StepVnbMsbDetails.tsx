import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { ConditionalCostFields } from "../questions/ConditionalCostFields";

const MSB_START_TIMELINE_OPTIONS = [
  { value: "sofort", label: "Sofort - wir sind in der Planung und das sieht gut aus" },
  { value: "zeitnah", label: "Zeitnah - wir warten auf den Start jederzeit" },
  { value: "12_monate", label: "In den nächsten 12 Monaten" },
  { value: "spaeter", label: "Später als in 12 Monaten" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const ADDITIONAL_COSTS_OPTIONS = [
  { value: "wissen_nicht", label: "Wissen wir nicht" },
  { value: "nein", label: "Nein, unser VNB/gMSB verlangt hier keine Zusatzkosten" },
  { value: "ja", label: "Ja, unser VNB/gMSB verlangt dafür Zusatzkosten" },
];

const FULL_SERVICE_OPTIONS = [
  { value: "nur_full_service", label: "Unser Stadtwerk/VNB bietet den Messstellenbetrieb in der GGV nur in Kombination mit einem Full-Service-Angebot an - also inkl. der Stromlieferung durch das Stadtwerk" },
  { value: "auch_ohne", label: "Unser Stadtwerk/VNB bietet die Zusammenarbeit an der GGV auch an, ohne selber den Strom zu verkaufen" },
];

const DATA_PROVISION_OPTIONS = [
  { value: "mail_excel", label: "Der VNB/gMSB stellt uns die Daten per Mail als Excel zur Verfügung" },
  { value: "portal_verrechnete_werte", label: "Der VNB/gMSB stellt uns die Daten über ein Online-Portal zur Verfügung, in dem wir die verrechneten Werte runterladen können" },
  { value: "portal_alle_messwerte", label: "Der VNB/gMSB stellt uns die Daten über ein Online-Portal zur Verfügung, in dem wir auf alle Messwerte der Teilnehmer zugreifen können, um diese selber zu verrechnen" },
  { value: "dienstleister_marktkommunikation", label: "Für das Abrufen der Daten brauchen wir einen eigenen Dienstleister, der die Daten über die Marktkommunikation vom VNB/gMSB abruft" },
  { value: "wissen_nicht", label: "Wissen wir nicht" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const DATA_COST_OPTIONS = [
  { value: "kostenlos", label: "Kostenlos" },
  { value: "weniger_3_eur", label: "Weniger als 3 EUR/Messstelle/Jahr" },
  { value: "mehr_3_eur", label: "Mehr als 3 EUR/Messstelle/Jahr" },
  { value: "keine_auskunft", label: "Dazu gibt es noch keine Auskunft" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

const ESA_COST_OPTIONS = [
  { value: "wissen_nicht", label: "Wissen wir nicht" },
  { value: "kostenlos", label: "Das macht er umsonst" },
  { value: "weniger_3_eur", label: "Dafür verlangt er weniger (oder gleich) 3 EUR/Messstelle/Jahr" },
  { value: "mehr_3_eur", label: "Dafür verlangt er mehr als 3 EUR/Messstelle/Jahr" },
];

const NO_MSB_TIMELINE_OPTIONS = [
  { value: "ja_12_monate", label: "Ja, innerhalb der nächsten 12 Monate" },
  { value: "ja_spaeter", label: "Ja, in über 12 Monaten" },
  { value: "nicht_gefragt", label: "Nein, das haben wir nicht gefragt" },
  { value: "keine_aussage", label: "Nein, dazu gab es keine Aussage" },
];

const WANDLERMESSUNG_OPTIONS = [
  { value: "ja", label: "Ja" },
  { value: "nein", label: "Nein" },
  { value: "wissen_nicht", label: "Das wissen wir nicht" },
];

const PLANNING_DURATION_OPTIONS = [
  { value: "unter_2_monate", label: "Unter 2 Monaten" },
  { value: "2_bis_12_monate", label: "Zwischen 2 und 12 Monaten" },
  { value: "ueber_12_monate", label: "Über 12 Monate" },
];

interface StepVnbMsbDetailsProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepVnbMsbDetails({ data, updateData }: StepVnbMsbDetailsProps) {
  const vnbOffersMsb = data.vnbMsbOffer === 'ja';
  const vnbDoesNotOfferMsb = data.vnbMsbOffer === 'nein_wmsb';
  const vnbRejectsCompletely = data.vnbMsbOffer === 'nein_gar_nicht';

  return (
    <div className="space-y-8">
      {/* If VNB offers MSB */}
      {vnbOffersMsb && (
        <>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">C8.1 Der VNB bietet Messstellenbetrieb an</h3>
            <p className="text-sm text-muted-foreground">Details zum Angebot Ihres VNB</p>
          </div>

          <SingleSelectQuestion
            id="vnb-start-timeline"
            label="C8.1a Ab wann kann das starten?"
            options={MSB_START_TIMELINE_OPTIONS}
            value={data.vnbStartTimeline}
            otherValue={data.vnbStartTimelineOther}
            onChange={(val) => updateData("vnbStartTimeline", val)}
            onOtherChange={(val) => updateData("vnbStartTimelineOther", val)}
          />

          <SingleSelectQuestion
            id="vnb-additional-costs"
            label="C8.1b Stellt Ihr VNB/gMSB zusätzliche Kosten für einen 'Einbau auf Kundenwunsch' in Rechnung?"
            options={ADDITIONAL_COSTS_OPTIONS}
            value={data.vnbAdditionalCosts}
            onChange={(val) => updateData("vnbAdditionalCosts", val)}
          />

          {data.vnbAdditionalCosts === 'ja' && (
            <ConditionalCostFields
              oneTimeValue={data.vnbAdditionalCostsOneTime}
              yearlyValue={data.vnbAdditionalCostsYearly}
              onOneTimeChange={(val) => updateData("vnbAdditionalCostsOneTime", val)}
              onYearlyChange={(val) => updateData("vnbAdditionalCostsYearly", val)}
              idPrefix="vnb-costs"
            />
          )}

          <SingleSelectQuestion
            id="vnb-full-service"
            label="C8.1c Einschränkende Bedingung Full-Service-Angebot"
            options={FULL_SERVICE_OPTIONS}
            value={data.vnbFullService}
            onChange={(val) => updateData("vnbFullService", val)}
          />

          <SingleSelectQuestion
            id="vnb-data-provision"
            label="C8.1d Wie beabsichtigt Ihr VNB, Ihnen die für die Abrechnung benötigten Daten bereitzustellen?"
            options={DATA_PROVISION_OPTIONS}
            value={data.vnbDataProvision}
            otherValue={data.vnbDataProvisionOther}
            onChange={(val) => updateData("vnbDataProvision", val)}
            onOtherChange={(val) => updateData("vnbDataProvisionOther", val)}
          />

          <SingleSelectQuestion
            id="vnb-data-cost"
            label="C8.1e Falls Ihr VNB/gMSB die Daten direkt an Sie übermittelt, was wird es kosten?"
            options={DATA_COST_OPTIONS}
            value={data.vnbDataCost}
            onChange={(val) => updateData("vnbDataCost", val)}
          />

          {data.vnbDataCost === 'mehr_3_eur' && (
            <TextQuestion
              id="vnb-data-cost-amount"
              label="Betrag in EUR/Messstelle/Jahr"
              type="number"
              value={data.vnbDataCostAmount}
              onChange={(val) => updateData("vnbDataCostAmount", val ? parseFloat(val) : undefined)}
              placeholder="z.B. 5"
              optional
            />
          )}

          <SingleSelectQuestion
            id="vnb-esa-cost"
            label="C8.1f Falls die Daten von einem Dienstleister über die 'ESA-Marktrolle' abgeholt werden müssen: Verlangt der VNB/gMSB dafür Geld?"
            options={ESA_COST_OPTIONS}
            value={data.vnbEsaCost}
            onChange={(val) => updateData("vnbEsaCost", val)}
          />

          {data.vnbEsaCost === 'mehr_3_eur' && (
            <TextQuestion
              id="vnb-esa-cost-amount"
              label="Betrag in EUR/Messstelle/Jahr"
              type="number"
              value={data.vnbEsaCostAmount}
              onChange={(val) => updateData("vnbEsaCostAmount", val ? parseFloat(val) : undefined)}
              placeholder="z.B. 5"
              optional
            />
          )}
        </>
      )}

      {/* If VNB does not offer MSB */}
      {vnbDoesNotOfferMsb && (
        <>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">C8.2a VNB bietet keinen eigenen Messstellenbetrieb</h3>
          </div>

          <SingleSelectQuestion
            id="vnb-msb-timeline"
            label="Hat der VNB in Aussicht gestellt, ab wann der grundzuständige Messstellenbetreiber die Verrechnung durchführen kann?"
            options={NO_MSB_TIMELINE_OPTIONS}
            value={data.vnbMsbTimeline}
            onChange={(val) => updateData("vnbMsbTimeline", val)}
          />
        </>
      )}

      {/* If VNB rejects completely */}
      {vnbRejectsCompletely && (
        <>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">C8.2b VNB lehnt Umsetzung ab</h3>
          </div>

          <SingleSelectQuestion
            id="vnb-rejection-timeline"
            label="Gibt es schon eine Aussage, ab wann eine Umsetzung möglich sein wird?"
            options={NO_MSB_TIMELINE_OPTIONS}
            value={data.vnbRejectionTimeline}
            onChange={(val) => updateData("vnbRejectionTimeline", val)}
          />
        </>
      )}

      {/* Common questions */}
      <SingleSelectQuestion
        id="vnb-wandlermessung"
        label="C9. Verlangt Ihr VNB einen neuen zusätzlichen Zähler direkt hinter dem Netzanschluss des Gebäudes?"
        description="Erfordert die Installation einer 'Wandlermessung' für > 5.000 EUR"
        options={WANDLERMESSUNG_OPTIONS}
        value={data.vnbWandlermessung}
        onChange={(val) => updateData("vnbWandlermessung", val)}
      />

      {data.vnbWandlermessung && (
        <TextQuestion
          id="vnb-wandlermessung-comment"
          label="Ergänzende Informationen zur Wandlermessung"
          type="textarea"
          value={data.vnbWandlermessungComment}
          onChange={(val) => updateData("vnbWandlermessungComment", val)}
          placeholder="Weitere Details..."
          optional
        />
      )}

      <SingleSelectQuestion
        id="vnb-planning-duration"
        label="C10. Wie lange sind Sie bereits in Diskussionen zur Umsetzung der GGV mit Ihrem VNB?"
        options={PLANNING_DURATION_OPTIONS}
        value={data.vnbPlanningDuration}
        onChange={(val) => updateData("vnbPlanningDuration", val)}
      />

      <TextQuestion
        id="vnb-planning-duration-reasons"
        label="Woran scheitert die Umsetzung bislang?"
        type="textarea"
        value={data.vnbPlanningDurationReasons}
        onChange={(val) => updateData("vnbPlanningDurationReasons", val)}
        placeholder="Beschreiben Sie die Gründe..."
        optional
      />
    </div>
  );
}
