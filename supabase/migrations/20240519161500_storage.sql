CREATE POLICY "grant ALL for users on the profiles bucket"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'profiles' AND (storage.foldername("name"))[1] = auth.uid()::text
) WITH CHECK (
  bucket_id = 'profiles' AND (storage.foldername("name"))[1] = auth.uid()::text
);