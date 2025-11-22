-- ============================================
-- Script de Migration pour la table rendezvous
-- Migre de patient_id vers nom/prenom
-- ============================================

-- Étape 1: Vérifier si patient_id existe et migrer les données si nécessaire
DO $$
BEGIN
    -- Vérifier si la colonne patient_id existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rendezvous' AND column_name = 'patient_id'
    ) THEN
        -- Étape 1.1: Supprimer l'ancien index sur patient_id s'il existe
        DROP INDEX IF EXISTS idx_rendezvous_patient;
        
        -- Étape 1.2: Ajouter les nouvelles colonnes nom et prenom (nullable d'abord)
        ALTER TABLE rendezvous 
            ADD COLUMN IF NOT EXISTS nom VARCHAR(100),
            ADD COLUMN IF NOT EXISTS prenom VARCHAR(100);
        
        -- Étape 1.3: Migrer les données existantes depuis la table patients
        -- Si des rendez-vous existent avec patient_id, on remplit nom et prenom
        UPDATE rendezvous r
        SET nom = COALESCE(p.nom, 'Inconnu'),
            prenom = COALESCE(p.prenom, 'Inconnu')
        FROM patients p
        WHERE r.patient_id = p.id 
            AND (r.nom IS NULL OR r.prenom IS NULL);
        
        -- Étape 1.4: Pour les rendez-vous sans patient_id valide, mettre des valeurs par défaut
        UPDATE rendezvous
        SET nom = COALESCE(nom, 'Inconnu'),
            prenom = COALESCE(prenom, 'Inconnu')
        WHERE nom IS NULL OR prenom IS NULL;
        
        -- Étape 1.5: Rendre les colonnes NOT NULL
        ALTER TABLE rendezvous 
            ALTER COLUMN nom SET NOT NULL,
            ALTER COLUMN prenom SET NOT NULL;
        
        -- Étape 1.6: Supprimer la contrainte de clé étrangère
        -- Trouver et supprimer toutes les contraintes de clé étrangère liées à patient_id
        FOR r IN (
            SELECT conname 
            FROM pg_constraint 
            WHERE conrelid = 'rendezvous'::regclass 
                AND contype = 'f' 
                AND confrelid = 'patients'::regclass
        ) LOOP
            EXECUTE 'ALTER TABLE rendezvous DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
        END LOOP;
        
        -- Étape 1.7: Supprimer la colonne patient_id
        ALTER TABLE rendezvous DROP COLUMN IF EXISTS patient_id;
        
        RAISE NOTICE 'Migration terminée: patient_id supprimé, nom et prenom ajoutés';
    ELSE
        RAISE NOTICE 'La colonne patient_id n''existe pas, la table est déjà migrée ou n''existe pas';
    END IF;
END $$;

-- Étape 2: Créer l'index sur nom s'il n'existe pas
CREATE INDEX IF NOT EXISTS idx_rendezvous_nom ON rendezvous(nom);

-- Étape 3: Vérification - Afficher la structure de la table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'rendezvous'
ORDER BY ordinal_position;

