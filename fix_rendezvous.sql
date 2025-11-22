-- ============================================
-- Script pour corriger la table rendezvous
-- Copiez et exécutez ce script dans Supabase SQL Editor
-- ============================================

-- Ajouter les colonnes nom et prenom
ALTER TABLE rendezvous ADD COLUMN IF NOT EXISTS nom VARCHAR(100);
ALTER TABLE rendezvous ADD COLUMN IF NOT EXISTS prenom VARCHAR(100);

-- Migrer les données depuis patient_id si elle existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rendezvous' AND column_name = 'patient_id'
    ) THEN
        UPDATE rendezvous r
        SET nom = COALESCE(p.nom, 'Inconnu'), prenom = COALESCE(p.prenom, 'Inconnu')
        FROM patients p
        WHERE r.patient_id = p.id AND (r.nom IS NULL OR r.prenom IS NULL);
        
        UPDATE rendezvous
        SET nom = COALESCE(nom, 'Inconnu'), prenom = COALESCE(prenom, 'Inconnu')
        WHERE nom IS NULL OR prenom IS NULL;
    ELSE
        UPDATE rendezvous
        SET nom = COALESCE(nom, 'Inconnu'), prenom = COALESCE(prenom, 'Inconnu')
        WHERE nom IS NULL OR prenom IS NULL;
    END IF;
END $$;

-- Rendre les colonnes NOT NULL
ALTER TABLE rendezvous ALTER COLUMN nom SET NOT NULL;
ALTER TABLE rendezvous ALTER COLUMN prenom SET NOT NULL;

-- Supprimer l'index sur patient_id
DROP INDEX IF EXISTS idx_rendezvous_patient;

-- Supprimer les contraintes de clé étrangère
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN (
        SELECT conname FROM pg_constraint 
        WHERE conrelid = 'rendezvous'::regclass 
        AND contype = 'f' 
        AND confrelid = 'patients'::regclass
    ) LOOP
        EXECUTE 'ALTER TABLE rendezvous DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Supprimer la colonne patient_id
ALTER TABLE rendezvous DROP COLUMN IF EXISTS patient_id;

-- Créer l'index sur nom
CREATE INDEX IF NOT EXISTS idx_rendezvous_nom ON rendezvous(nom);

