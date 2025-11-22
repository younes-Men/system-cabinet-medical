-- ============================================
-- Script pour ajouter la colonne téléphone
-- à la table rendezvous
-- ============================================

-- Ajouter la colonne telephone si elle n'existe pas
ALTER TABLE rendezvous ADD COLUMN IF NOT EXISTS telephone VARCHAR(20);

-- Vérification
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'rendezvous' AND column_name = 'telephone';

