-- Agrega la columna about_me_banner_image a la tabla site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_me_banner_image TEXT;
