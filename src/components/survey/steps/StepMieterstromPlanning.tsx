import { SurveyData } from "@/types/survey";
import { SingleSelectQuestion } from "../questions/SingleSelectQuestion";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";
import { TextQuestion } from "../questions/TextQuestion";
import { RatingQuestion } from "../questions/RatingQuestion";
import { FileUpload } from "../questions/FileUpload";
import { getOptionsForQuestion, getLabelForQuestion, getQuestionById } from "@/data/surveySchema";

interface StepMieterstromPlanningProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
  uploadedDocuments: string[];
  setUploadedDocuments: (docs: string[]) => void;
}

export function StepMieterstromPlanning({ data, updateData, uploadedDocuments, setUploadedDocuments }: StepMieterstromPlanningProps) {
  const supportRatingQ = getQuestionById("mieterstromSupportRating");

  return (
    <div className="space-y-8">
      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-2">Detaillierte Fragen zu Mieterstrom</h3>
        <p className="text-sm text-muted-foreground">
          Dieser Abschnitt behandelt Ihre Erfahrungen mit Mieterstrom-Projekten.
        </p>
      </div>

      <SingleSelectQuestion
        id="mieterstrom-summenzaehler"
        label={getLabelForQuestion("mieterstromSummenzaehler")}
        options={getOptionsForQuestion("mieterstromSummenzaehler")}
        value={data.mieterstromSummenzaehler}
        onChange={(val) => updateData("mieterstromSummenzaehler", val)}
      />

      <MultiSelectQuestion
        id="mieterstrom-challenges"
        label={getLabelForQuestion("mieterstromChallenges")}
        options={getOptionsForQuestion("mieterstromChallenges")}
        value={data.mieterstromChallenges || []}
        optionTextValues={{
          opposition: data.mieterstromChallengesOpposition,
          pv_installation: data.mieterstromChallengesPv,
          vnb_blocking: data.mieterstromChallengesVnb,
          kosten: data.mieterstromChallengesCosts,
          sonstiges: data.mieterstromChallengesOther,
        }}
        onChange={(val) => updateData("mieterstromChallenges", val)}
        onOptionTextChange={(optVal, text) => {
          if (optVal === 'opposition') updateData("mieterstromChallengesOpposition", text);
          if (optVal === 'pv_installation') updateData("mieterstromChallengesPv", text);
          if (optVal === 'vnb_blocking') updateData("mieterstromChallengesVnb", text);
          if (optVal === 'kosten') updateData("mieterstromChallengesCosts", text);
          if (optVal === 'sonstiges') updateData("mieterstromChallengesOther", text);
        }}
      />

      <SingleSelectQuestion
        id="mieterstrom-existing-projects"
        label={getLabelForQuestion("mieterstromExistingProjects")}
        options={getOptionsForQuestion("mieterstromExistingProjects")}
        value={data.mieterstromExistingProjects}
        onChange={(val) => updateData("mieterstromExistingProjects", val)}
      />

      <SingleSelectQuestion
        id="mieterstrom-existing-projects-virtuell"
        label={getLabelForQuestion("mieterstromExistingProjectsVirtuell")}
        options={getOptionsForQuestion("mieterstromExistingProjectsVirtuell")}
        value={data.mieterstromExistingProjectsVirtuell}
        onChange={(val) => updateData("mieterstromExistingProjectsVirtuell", val)}
      />

      <SingleSelectQuestion
        id="mieterstrom-vnb-contact"
        label={getLabelForQuestion("mieterstromVnbContact")}
        options={getOptionsForQuestion("mieterstromVnbContact")}
        value={data.mieterstromVnbContact}
        otherValue={data.mieterstromVnbContactOther}
        onChange={(val) => updateData("mieterstromVnbContact", val)}
        onOtherChange={(val) => updateData("mieterstromVnbContactOther", val)}
        optional
      />

      <SingleSelectQuestion
        id="mieterstrom-virtuell-allowed"
        label={getLabelForQuestion("mieterstromVirtuellAllowed")}
        options={getOptionsForQuestion("mieterstromVirtuellAllowed")}
        value={data.mieterstromVirtuellAllowed}
        onChange={(val) => updateData("mieterstromVirtuellAllowed", val)}
      />

      {data.mieterstromVirtuellAllowed === 'ja' && (
        <SingleSelectQuestion
          id="mieterstrom-virtuell-wandlermessung"
          label={getLabelForQuestion("mieterstromVirtuellWandlermessung")}
          options={getOptionsForQuestion("mieterstromVirtuellWandlermessung")}
          value={data.mieterstromVirtuellWandlermessung}
          otherValue={data.mieterstromVirtuellWandlermessungComment}
          onChange={(val) => updateData("mieterstromVirtuellWandlermessung", val)}
          onOtherChange={(val) => updateData("mieterstromVirtuellWandlermessungComment", val)}
        />
      )}

      <MultiSelectQuestion
        id="mieterstrom-vnb-response"
        label={getLabelForQuestion("mieterstromVnbResponse")}
        options={getOptionsForQuestion("mieterstromVnbResponse")}
        value={data.mieterstromVnbResponse || []}
        onChange={(val) => updateData("mieterstromVnbResponse", val)}
        optional
      />

      {data.mieterstromVnbResponse?.includes('nicht_moeglich') && (
        <>
          <TextQuestion
            id="mieterstrom-vnb-response-reasons"
            label="Gründe für die Ablehnung"
            type="textarea"
            value={data.mieterstromVnbResponseReasons}
            onChange={(val) => updateData("mieterstromVnbResponseReasons", val)}
            placeholder="Beschreiben Sie die Gründe..."
            optional
          />
          <FileUpload
            id="mieterstrom-rejection-docs"
            label="Möglichkeit zum Hochladen von Dokumenten"
            description="z.B. Korrespondenz mit dem VNB, Ablehnungsschreiben"
            value={uploadedDocuments}
            onChange={setUploadedDocuments}
          />
        </>
      )}

      <MultiSelectQuestion
        id="mieterstrom-vnb-support"
        label={getLabelForQuestion("mieterstromVnbSupport")}
        options={getOptionsForQuestion("mieterstromVnbSupport")}
        value={data.mieterstromVnbSupport || []}
        otherValue={data.mieterstromVnbSupportOther}
        onChange={(val) => updateData("mieterstromVnbSupport", val)}
        onOtherChange={(val) => updateData("mieterstromVnbSupportOther", val)}
      />

      <SingleSelectQuestion
        id="mieterstrom-vnb-helpful"
        label={getLabelForQuestion("mieterstromVnbHelpful")}
        options={getOptionsForQuestion("mieterstromVnbHelpful")}
        value={data.mieterstromVnbHelpful}
        otherValue={data.mieterstromVnbHelpfulOther}
        onChange={(val) => updateData("mieterstromVnbHelpful", val)}
        onOtherChange={(val) => updateData("mieterstromVnbHelpfulOther", val)}
      />

      <SingleSelectQuestion
        id="mieterstrom-personal-contacts"
        label={getLabelForQuestion("mieterstromPersonalContacts")}
        options={getOptionsForQuestion("mieterstromPersonalContacts")}
        value={data.mieterstromPersonalContacts}
        otherValue={data.mieterstromPersonalContactsOther}
        onChange={(val) => updateData("mieterstromPersonalContacts", val)}
        onOtherChange={(val) => updateData("mieterstromPersonalContactsOther", val)}
      />

      <RatingQuestion
        id="mieterstrom-support-rating"
        label={getLabelForQuestion("mieterstromSupportRating")}
        value={data.mieterstromSupportRating}
        onChange={(val) => updateData("mieterstromSupportRating", val)}
        minLabel={supportRatingQ?.minLabel || "Unser VNB will das eigentlich lieber verhindern"}
        maxLabel={supportRatingQ?.maxLabel || "Unser VNB möchte das wirklich mit uns umsetzen"}
        min={supportRatingQ?.min || 1}
        max={supportRatingQ?.max || 10}
      />
    </div>
  );
}
