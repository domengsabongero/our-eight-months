REVOKE EXECUTE ON FUNCTION public.can_read_letter(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_letter_author(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.can_read_letter(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_letter_author(uuid, uuid) TO authenticated, service_role;