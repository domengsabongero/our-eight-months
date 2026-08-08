CREATE POLICY "Read letter files of readable letters"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'letters'
    AND public.can_read_letter((split_part(name, '/', 1))::uuid, auth.uid())
  );

CREATE POLICY "Letter author can upload files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'letters'
    AND public.is_letter_author((split_part(name, '/', 1))::uuid, auth.uid())
  );

CREATE POLICY "Letter author can update files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'letters'
    AND public.is_letter_author((split_part(name, '/', 1))::uuid, auth.uid())
  );

CREATE POLICY "Letter author can delete files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'letters'
    AND public.is_letter_author((split_part(name, '/', 1))::uuid, auth.uid())
  );