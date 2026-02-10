import { SurveyData } from "@/types/survey";
import { TextQuestion } from "../questions/TextQuestion";
import { RatingQuestion } from "../questions/RatingQuestion";
import { getOptionsForQuestion, getLabelForQuestion, getQuestionById } from "@/data/surveySchema";

interface StepServiceProviderProps {
  data: SurveyData;
  updateData: <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => void;
}

export function StepServiceProvider({ data, updateData }: StepServiceProviderProps) {
  const sp2Q = getQuestionById("serviceProvider2Rating");

  return (
    <div className="space-y-8">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Feedback zum Dienstleister</h3>
        <p className="text-sm text-muted-foreground">
          Falls Sie mit Dienstleistern zusammenarbeiten, teilen Sie Ihre Erfahrungen.
        </p>
      </div>

      <div className="space-y-6">
        <h4 className="font-medium">{getLabelForQuestion("serviceProviderName")}</h4>
        
        <div className="p-4 border rounded-lg space-y-4">
          <TextQuestion
            id="service-provider-name"
            label="Dienstleister 1"
            value={data.serviceProviderName}
            onChange={(val) => updateData("serviceProviderName", val)}
            placeholder="Name des Dienstleisters"
            optional
          />

          {/* Korrektur: serviceProviderRating GELÖSCHT - only show comments */}
          {data.serviceProviderName && (
            <TextQuestion
              id="service-provider-comments"
              label={getLabelForQuestion("serviceProviderComments")}
              type="textarea"
              value={data.serviceProviderComments}
              onChange={(val) => updateData("serviceProviderComments", val)}
              placeholder="Was lief gut? Was könnte besser sein?"
              optional
            />
          )}
        </div>

        {data.serviceProviderName && (
          <div className="p-4 border rounded-lg space-y-4">
            <TextQuestion
              id="service-provider-2-name"
              label={getLabelForQuestion("serviceProvider2Name")}
              value={data.serviceProvider2Name}
              onChange={(val) => updateData("serviceProvider2Name", val)}
              placeholder="Name des zweiten Dienstleisters"
              optional
            />

            {data.serviceProvider2Name && (
              <>
                <RatingQuestion
                  id="service-provider-2-rating"
                  label={getLabelForQuestion("serviceProvider2Rating")}
                  value={data.serviceProvider2Rating}
                  onChange={(val) => updateData("serviceProvider2Rating", val)}
                  minLabel={sp2Q?.minLabel || "Sehr unzufrieden"}
                  maxLabel={sp2Q?.maxLabel || "Sehr zufrieden"}
                  min={sp2Q?.min || 1}
                  max={sp2Q?.max || 10}
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

      {/* Korrektur: vnbRejectionResponse removed from here, moved to StepChallenges */}
    </div>
  );
}
