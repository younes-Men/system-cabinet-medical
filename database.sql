-- ============================================
-- Script SQL pour Supabase - Cabinet Médical
-- ============================================

-- Table: users (utilisateurs du système)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'assistant',
    nom VARCHAR(100),
    prenom VARCHAR(100),
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: patients
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    cin VARCHAR(20) UNIQUE NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    date_naissance DATE,
    adresse TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: consultations
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    date_consultation DATE NOT NULL,
    motif VARCHAR(200),
    diagnostic TEXT,
    traitement TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: rendezvous
CREATE TABLE IF NOT EXISTS rendezvous (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    date_rdv DATE NOT NULL,
    heure_rdv TIME NOT NULL,
    motif VARCHAR(200),
    notes TEXT,
    statut VARCHAR(20) DEFAULT 'programmé',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: paiements
CREATE TABLE IF NOT EXISTS paiements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    date_paiement DATE NOT NULL,
    montant DECIMAL(10, 2) NOT NULL,
    mode_paiement VARCHAR(50) DEFAULT 'espèces',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: controles
CREATE TABLE IF NOT EXISTS controles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    date_controle DATE NOT NULL,
    heure_controle TIME NOT NULL,
    motif VARCHAR(200),
    notes TEXT,
    statut VARCHAR(20) DEFAULT 'programmé',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(date_consultation);
CREATE INDEX IF NOT EXISTS idx_rendezvous_nom ON rendezvous(nom);
CREATE INDEX IF NOT EXISTS idx_rendezvous_date ON rendezvous(date_rdv);
CREATE INDEX IF NOT EXISTS idx_paiements_patient ON paiements(patient_id);
CREATE INDEX IF NOT EXISTS idx_paiements_date ON paiements(date_paiement);
CREATE INDEX IF NOT EXISTS idx_controles_patient ON controles(patient_id);
CREATE INDEX IF NOT EXISTS idx_controles_date ON controles(date_controle);
CREATE INDEX IF NOT EXISTS idx_patients_cin ON patients(cin);
CREATE INDEX IF NOT EXISTS idx_patients_telephone ON patients(telephone);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at (supprimer d'abord s'ils existent)
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consultations_updated_at ON consultations;
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rendezvous_updated_at ON rendezvous;
CREATE TRIGGER update_rendezvous_updated_at BEFORE UPDATE ON rendezvous
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_controles_updated_at ON controles;
CREATE TRIGGER update_controles_updated_at BEFORE UPDATE ON controles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rendezvous ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE controles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS - Permettre toutes les opérations (à ajuster selon vos besoins de sécurité)
-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON patients;
CREATE POLICY "Enable all operations for authenticated users" ON patients
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON consultations;
CREATE POLICY "Enable all operations for authenticated users" ON consultations
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON rendezvous;
CREATE POLICY "Enable all operations for authenticated users" ON rendezvous
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON paiements;
CREATE POLICY "Enable all operations for authenticated users" ON paiements
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON controles;
CREATE POLICY "Enable all operations for authenticated users" ON controles
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON users;
CREATE POLICY "Enable all operations for authenticated users" ON users
    FOR ALL USING (true) WITH CHECK (true);

-- Commentaires pour la documentation
COMMENT ON TABLE users IS 'Table des utilisateurs du système (docteur, assistant)';
COMMENT ON TABLE patients IS 'Table des patients du cabinet médical';
COMMENT ON TABLE consultations IS 'Table des consultations médicales';
COMMENT ON TABLE rendezvous IS 'Table des rendez-vous';
COMMENT ON TABLE paiements IS 'Table des paiements des patients';
COMMENT ON TABLE controles IS 'Table des contrôles de suivi médical';

-- Insertion d'utilisateurs par défaut (mot de passe: docteur123 et assistant123)
-- Note: En production, utilisez un hash pour les mots de passe (bcrypt, etc.)
INSERT INTO users (username, password, role, nom, prenom) VALUES
('docteur', 'docteur123', 'docteur', 'Docteur', 'Principal'),
('assistant', 'assistant123', 'assistant', 'Assistant', 'Cabinet')
ON CONFLICT (username) DO NOTHING;

