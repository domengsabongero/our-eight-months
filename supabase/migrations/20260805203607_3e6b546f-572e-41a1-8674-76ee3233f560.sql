CREATE POLICY "Keepsake members can read files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id IN ('avatars','gallery','pets')
    AND EXISTS (SELECT 1 FROM public.space_members m WHERE m.user_id = auth.uid()));

CREATE POLICY "Keepsake members can upload files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('avatars','gallery','pets')
    AND owner = auth.uid()
    AND EXISTS (SELECT 1 FROM public.space_members m WHERE m.user_id = auth.uid()));

CREATE POLICY "Keepsake members can update own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('avatars','gallery','pets') AND owner = auth.uid())
  WITH CHECK (bucket_id IN ('avatars','gallery','pets') AND owner = auth.uid());

CREATE POLICY "Keepsake members can delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('avatars','gallery','pets') AND owner = auth.uid());
