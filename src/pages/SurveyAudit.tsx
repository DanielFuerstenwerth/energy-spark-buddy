import { surveySchema } from "@/data/surveySchema";

// Statische Audit-/Druckansicht der Umfrage - wird ohne JavaScript im HTML gerendert
export default function SurveyAudit() {
  return (
    <html lang="de">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{surveySchema.title} - Audit-Ansicht</title>
        <style dangerouslySetInnerHTML={{ __html: `
          body { font-family: system-ui, -apple-system, sans-serif; max-width: 900px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
          h1 { color: #1a1a1a; border-bottom: 2px solid #e5e5e5; padding-bottom: 0.5rem; }
          h2 { color: #333; margin-top: 2rem; background: #f5f5f5; padding: 0.5rem 1rem; border-radius: 4px; }
          h3 { color: #555; margin-top: 1.5rem; }
          .meta { color: #666; font-size: 0.9rem; margin-bottom: 2rem; }
          .section { margin-bottom: 2rem; border: 1px solid #e5e5e5; padding: 1rem; border-radius: 8px; }
          .question { margin: 1rem 0; padding: 1rem; background: #fafafa; border-radius: 4px; }
          .question-label { font-weight: 600; margin-bottom: 0.5rem; }
          .question-meta { font-size: 0.85rem; color: #666; margin-bottom: 0.5rem; }
          .options { margin-left: 1.5rem; }
          .option { padding: 0.25rem 0; }
          .option-value { color: #888; font-size: 0.8rem; }
          .badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 3px; font-size: 0.75rem; margin-left: 0.5rem; }
          .required { background: #fee2e2; color: #dc2626; }
          .optional { background: #e0f2fe; color: #0284c7; }
          .visibility { background: #fef3c7; color: #d97706; font-size: 0.8rem; margin-top: 0.5rem; padding: 0.25rem 0.5rem; border-radius: 3px; }
          .type-badge { background: #e5e7eb; color: #374151; }
          .scale-labels { font-size: 0.85rem; color: #666; margin-top: 0.5rem; }
          @media print { body { padding: 1rem; } .section { break-inside: avoid; } }
        ` }} />
      </head>
      <body>
        <h1>{surveySchema.title}</h1>
        <div className="meta">
          <p><strong>Version:</strong> {surveySchema.version} | <strong>Letzte Aktualisierung:</strong> {surveySchema.lastUpdated}</p>
          <p>{surveySchema.description}</p>
          <p><a href="/data/umfrage.json">JSON-Export herunterladen</a> | <a href="/umfrage">Zur interaktiven Umfrage</a></p>
        </div>

        {surveySchema.sections.map((section) => (
          <div key={section.id} className="section">
            <h2>{section.title}</h2>
            {section.description && <p>{section.description}</p>}
            {section.visibilityLogic && (
              <div className="visibility">⚡ Branching: {section.visibilityLogic}</div>
            )}

            {section.questions.map((question) => (
              <div key={question.id} className="question">
                <div className="question-label">
                  {question.label}
                  <span className={`badge type-badge`}>{question.type}</span>
                  {question.required && <span className="badge required">Pflicht</span>}
                  {question.optional && <span className="badge optional">Optional</span>}
                </div>
                
                {question.description && (
                  <div className="question-meta">{question.description}</div>
                )}
                {question.helpText && (
                  <div className="question-meta">ℹ️ {question.helpText}</div>
                )}

                {question.options && question.options.length > 0 && (
                  <div className="options">
                    {question.options.map((option) => (
                      <div key={option.value} className="option">
                        • {option.label}
                        <span className="option-value"> [{option.value}]</span>
                        {option.hasTextField && <em> + Textfeld{option.textFieldLabel ? `: "${option.textFieldLabel}"` : ''}</em>}
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'rating' && (
                  <div className="scale-labels">
                    Skala: {question.min} ({question.minLabel}) bis {question.max} ({question.maxLabel})
                  </div>
                )}

                {question.visibilityLogic && (
                  <div className="visibility">⚡ {question.visibilityLogic}</div>
                )}
                {question.skipLogic && (
                  <div className="visibility">➡️ {question.skipLogic}</div>
                )}
              </div>
            ))}
          </div>
        ))}

        <footer style={{ marginTop: '3rem', padding: '1rem', borderTop: '1px solid #e5e5e5', color: '#666', fontSize: '0.9rem' }}>
          <p>Diese Seite zeigt die vollständige Struktur der Umfrage für Audit-Zwecke.</p>
          <p>Generiert am: {new Date().toISOString().split('T')[0]}</p>
        </footer>
      </body>
    </html>
  );
}
