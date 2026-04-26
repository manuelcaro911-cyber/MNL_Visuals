-- SQL para asegurar que los cambios de likes y datos de la pizarra sean permanentes

-- 1. Asegurar que la columna 'likes' exista en la tabla 'drawings' y sea de tipo TEXT[]
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS likes TEXT[] DEFAULT '{}';

-- 2. Asegurar que la columna 'data' exista en la tabla 'drawings' para guardar los datos de la pizarra
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS data JSONB;

-- 3. Asegurar que la columna 'status' permita 'draft' (borrador)
ALTER TABLE public.drawings DROP CONSTRAINT IF EXISTS drawings_status_check;
ALTER TABLE public.drawings ADD CONSTRAINT drawings_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'draft'));

-- 4. Asegurar que la columna 'likes' exista en la tabla 'feedback'
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS likes TEXT[] DEFAULT '{}';
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS dislikes TEXT[] DEFAULT '{}';
