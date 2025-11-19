-- Setze Admin-Rolle für daniel.fuerstenwerth@1000gw.de
-- User ID aus Auth-Logs: 90707642-b16c-47b1-a11f-c4b2d1da12fd
INSERT INTO public.user_roles (user_id, role)
VALUES ('90707642-b16c-47b1-a11f-c4b2d1da12fd', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;