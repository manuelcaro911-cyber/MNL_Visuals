insert into storage.buckets (id, name, public) values ('drawings', 'drawings', true);
create policy "Public Access" on storage.objects for select using ( bucket_id = 'drawings' );
create policy "Authenticated Users can upload" on storage.objects for insert with check ( bucket_id = 'drawings' and auth.role() = 'authenticated' );
create policy "Users can update their own objects" on storage.objects for update using ( bucket_id = 'drawings' and auth.uid() = owner );
create policy "Users can delete their own objects" on storage.objects for delete using ( bucket_id = 'drawings' and auth.uid() = owner );