import { SurveyData } from "@/types/survey";
import { TextQuestion } from "../questions/TextQuestion";
import { RatingQuestion } from "../questions/RatingQuestion";
import { MultiSelectQuestion } from "../questions/MultiSelectQuestion";

const VNB_REJECTION_RESPONSE_OPTIONS = [
  { value: "bnetza", label: "Wir haben uns bereits an die BNetzA gewendet" },
  { value: "rechtliche_schritte", label: "Wir überlegen rechtliche Schritte zu gehen" },
  { value: "keine_schritte", label: "Wir sind bei dem Anschluss anderer Projekte auf den VNB angewiesen und sehen von rechtlichen Schritten gegenüber dem VNB ab" },
  { value: "sonstiges", label: "Sonstiges", hasTextField: true },
];

interface StepServiceProviderProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepServiceProvider({ data, updateData }: StepServiceProviderProps) {
  return (
    <div className="space-y-8">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Feedback zum Dienstleister</h3>
        <p className="text-sm text-muted-foreground">
          Falls Sie mit Dienstleistern zusammenarbeiten, teilen Sie Ihre Erfahrungen.
        </p>
      </div>

      <div className="space-y-6">
        <h4 className="font-medium">D8. Mit welchem Dienstleister arbeiten Sie zusammen?</h4>
        
        <div className="p-4 border rounded-lg space-y-4">
          <TextQuestion
            id="service-provider-name"
            label="Dienstleister 1"
            value={data.serviceProviderName}
            onChange={(val) => updateData("serviceProviderName", val)}
            placeholder="Name des Dienstleisters"
            optional
          />

          {data.serviceProviderName && (
            <>
              <RatingQuestion
                id="service-provider-rating"
                label="Zufriedenheit mit Dienstleister 1"
                value={data.serviceProviderRating}
                onChange={(val) => updateData("serviceProviderRating", val)}
                minLabel="Sehr unzufrieden"
                maxLabel="Sehr zufrieden"
                min={1}
                max={10}
                optional
              />

              <TextQuestion
                id="service-provider-comments"
                label="Kommentare zu Dienstleister 1"
                type="textarea"
                value={data.serviceProviderComments}
                onChange={(val) => updateData("serviceProviderComments", val)}
                placeholder="Was lief gut? Was könnte besser sein?"
                optional
              />
            </>
          )}
        </div>

        {data.serviceProviderName && (
          <div className="p-4 border rounded-lg space-y-4">
            <TextQuestion
              id="service-provider-2-name"
              label="Dienstleister 2 (optional)"
              value={data.serviceProvider2Name}
              onChange={(val) => updateData("serviceProvider2Name", val)}
              placeholder="Name des zweiten Dienstleisters"
              optional
            />

            {data.serviceProvider2Name && (
              <>
                <RatingQuestion
                  id="service-provider-2-rating"
                  label="Zufriedenheit mit Dienstleister 2"
                  value={data.serviceProvider2Rating}
                  onChange={(val) => updateData("serviceProvider2Rating", val)}
                  minLabel="Sehr unzufrieden"
                  maxLabel="Sehr zufrieden"
                  min={1}
                  max={10}
                  optional
                />

                <TextQuestion
                  id="service-provider-2-comments"
                  label="Kommentare zu Dienstleister 2"
                  type="textarea"
                  value={data.serviceProvider2Comments}
                  onChange={(val) => updateData("serviceProvider2Comments", val)}
                  placeholder="Was lief gut? Was könnte besser sein?"
                  optional
                />
              </>
            )}
          </div>
        )}
      </div>

      <MultiSelectQuestion
        id="vnb-rejection-response"
        label="D9. Falls Ihr VNB die GGV nicht oder nur unzureichend anbietet/umsetzt, wie haben Sie bislang reagiert?"
        options={VNB_REJECTION_RESPONSE_OPTIONS}
        value={data.vnbRejectionResponse || []}
        otherValue={data.vnbRejectionResponseOther}
        onChange={(val) => updateData("vnbRejectionResponse", val)}
        onOtherChange={(val) => updateData("vnbRejectionResponseOther", val)}
        optional
      />
    </div>
  );
}
