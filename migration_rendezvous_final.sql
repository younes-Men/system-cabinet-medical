-- ============================================
-- Script de Migration FINAL pour rendezvous
-- Migre de patient_id vers nom/prenom
-- ============================================
-- Ce script gère automatiquement tous les cas :
-- - Si patient_id existe, il migre les données puis supprime la colonne
-- - Si patient_id n'existe pas, il ajoute simplement nom/prenom
-- ============================================

-- Étape 1: Ajouter les colonnes nom et prenom si elles n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rendezvous' AND column_name = 'nom'
    ) THEN
        ALTER TABLE rendezvous ADD COLUMN nom VARCHAR(100);
        RAISE NOTICE 'Colonne nom ajoutée';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rendezvous' AND column_name = 'prenom'
    ) THEN
        ALTER TABLE rendezvous ADD COLUMN prenom VARCHAR(100);
        RAISE NOTICE 'Colonne prenom ajoutée';
    END IF;
END $$;

-- Étape 2: Si patient_id existe, migrer les données
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rendezvous' AND column_name = 'patient_id'
    ) THEN
        -- Migrer les données depuis la table patients
        UPDATE rendezvous r
        SET 
            nom = COALESCE(p.nom, 'Inconnu'),
            prenom = COALESCE(p.prenom, 'Inconnu')
        FROM patients p
        WHERE r.patient_id = p.id 
            AND (r.nom IS NULL OR r.prenom IS NULL);
        
        -- Pour les rendez-vous sans patient_id valide, mettre des valeurs par défaut
        UPDATE rendezvous
        SET 
            nom = COALESCE(nom, 'Inconnu'),
            prenom = COALESCE(prenom, 'Inconnu')
        WHERE nom IS NULL OR prenom IS NULL;
        
        RAISE NOTICE 'Données migrées depuis patient_id';
    ELSE
        -- Si patient_id n'existe pas, mettre des valeurs par défaut pour les données existantes
        UPDATE rendezvous
        SET 
            nom = COALESCE(nom, 'Inconnu'),
            prenom = COALESCE(prenom, 'Inconnu')
        WHERE nom IS NULL OR prenom IS NULL;
    END IF;
END $$;

-- Étape 3: Rendre les colonnes NOT NULL
ALTER TABLE rendezvous 
    ALTER COLUMN nom SET NOT NULL,
    ALTER COLUMN prenom SET NOT NULL;

-- Étape 4: Supprimer l'index sur patient_id s'il existe
DROP INDEX IF EXISTS idx_rendezvous_patient;

-- Étape 5: Supprimer les contraintes de clé étrangère sur patient_id
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
        RAISE NOTICE 'Contrainte supprimée: %', constraint_record.conname;
    END LOOP;
END $$;

-- Étape 6: Supprimer la colonne patient_id si elle existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rendezvous' AND column_name = 'patient_id'
    ) THEN
        ALTER TABLE rendezvous DROP COLUMN patient_id;
        RAISE NOTICE 'Colonne patient_id supprimée';
    END IF;
END $$;

-- Étape 7: Créer l'index sur nom
CREATE INDEX IF NOT EXISTS idx_rendezvous_nom ON rendezvous(nom);

-- Vérification finale
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'rendezvous'
ORDER BY ordinal_position;

