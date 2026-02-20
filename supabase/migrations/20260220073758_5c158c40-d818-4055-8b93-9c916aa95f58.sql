-- Allow anonymous users to delete their own draft survey responses (by draft_token)
CREATE POLICY "Anyone can delete their own drafts"
ON public.survey_responses
FOR DELETE
USING (
  status = 'draft'
  AND draft_token IS NOT NULL
);