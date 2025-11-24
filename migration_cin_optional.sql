-- ============================================
-- Migration: Rendre le champ CIN optionnel dans la table patients
-- ============================================

-- Supprimer la contrainte NOT NULL du champ CIN
ALTER TABLE patients ALTER COLUMN cin DROP NOT NULL;

-- Note: La contrainte UNIQUE reste active, mais le champ peut maintenant être NULL
-- Cela signifie qu'un patient peut ne pas avoir de CIN, mais s'il en a un, il doit être unique

