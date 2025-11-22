-- ============================================
-- Script de Migration SIMPLE pour rendezvous
-- Migre de patient_id vers nom/prenom
-- ============================================
-- 
-- ATTENTION: Ce script supprime la colonne patient_id
-- Si vous avez des données importantes dans rendezvous, utilisez migration_rendezvous.sql
-- ============================================

-- Étape 1: Supprimer l'index sur patient_id s'il existe
DROP INDEX IF EXISTS idx_rendezvous_patient;

-- Étape 2: Supprimer toutes les contraintes de clé étrangère sur patient_id
DO $$
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'rendezvous'::regclass 
            AND contype = 'f'
            AND conname LIKE '%patient_id%'
    ) LOOP
        EXECUTE 'ALTER TABLE rendezvous DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_name);
    END LOOP;
END $$;

-- Supprimer aussi les contraintes qui référencent patients
DO $$
DECLARE
    constraint_record record;
BEGIN
    FOR constraint_record IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'rendezvous'::regclass 
            AND contype = 'f' 
            AND confrelid = 'patients'::regclass
    ) LOOP
        EXECUTE 'ALTER TABLE rendezvous DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_record.conname);
    END LOOP;
END $$;

-- Étape 3: Supprimer la colonne patient_id si elle existe
ALTER TABLE rendezvous DROP COLUMN IF EXISTS patient_id;

-- Étape 4: Ajouter les colonnes nom et prenom si elles n'existent pas déjà
DO $$
BEGIN
    -- Ajouter nom si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rendezvous' AND column_name = 'nom'
    ) THEN
        ALTER TABLE rendezvous ADD COLUMN nom VARCHAR(100);
        -- Si la table a des données, mettre une valeur par défaut
        UPDATE rendezvous SET nom = 'Inconnu' WHERE nom IS NULL;
        -- Rendre NOT NULL
        ALTER TABLE rendezvous ALTER COLUMN nom SET NOT NULL;
    END IF;
    
    -- Ajouter prenom si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rendezvous' AND column_name = 'prenom'
    ) THEN
        ALTER TABLE rendezvous ADD COLUMN prenom VARCHAR(100);
        -- Si la table a des données, mettre une valeur par défaut
        UPDATE rendezvous SET prenom = 'Inconnu' WHERE prenom IS NULL;
        -- Rendre NOT NULL
        ALTER TABLE rendezvous ALTER COLUMN prenom SET NOT NULL;
    END IF;
END $$;

-- Étape 6: Créer l'index sur nom
CREATE INDEX IF NOT EXISTS idx_rendezvous_nom ON rendezvous(nom);

-- Vérification finale
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'rendezvous'
ORDER BY ordinal_position;

