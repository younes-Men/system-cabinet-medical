-- ============================================
-- Migration: Supprimer la colonne email de la table patients
-- ============================================

-- Supprimer la colonne email de la table patients
ALTER TABLE patients DROP COLUMN IF EXISTS email;

-- Commentaire pour la documentation
COMMENT ON TABLE patients IS 'Table des patients du cabinet médical (sans email)';


