-- Fix security issues: Restrict sources table and add proper policies

-- 1. Drop the overly permissive public insert policy on sources
DROP POLICY IF EXISTS "Allow public insert of sources" ON public.sources;

-- 2. Add admin-only insert policy for sources
CREATE POLICY "Only admins can insert sources"
ON public.sources
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Ensure conversations and messages can only be created by authenticated users
-- (Even though edge functions bypass RLS, this adds a layer of protection)
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can create messages" ON public.messages;
CREATE POLICY "Authenticated users can create messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (true);