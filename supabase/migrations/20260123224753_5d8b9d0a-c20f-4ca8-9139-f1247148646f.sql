-- Fix storage policies for survey-documents bucket
-- Remove overly permissive policies and add secure ones

-- First, drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can upload survey documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view survey documents" ON storage.objects;

-- Create a more restrictive upload policy
-- Allow anonymous uploads but only to specific path pattern
CREATE POLICY "Survey document uploads restricted to uploads folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'survey-documents' 
  AND (storage.foldername(name))[1] = 'uploads'
);

-- Only admins can view/download survey documents
CREATE POLICY "Only admins can view survey documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'survey-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can delete survey documents
CREATE POLICY "Only admins can delete survey documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'survey-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Make the bucket private (not publicly accessible)
UPDATE storage.buckets 
SET public = false 
WHERE id = 'survey-documents';