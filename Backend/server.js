import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ========== AUTHENTICATION ROUTES ==========
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('actif', true)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }

    // Vérification du mot de passe (simple comparaison pour l'instant)
    // En production, utilisez bcrypt pour hasher les mots de passe
    if (data.password !== password) {
      return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }

    // Retourner les informations de l'utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = data;
    res.json({ 
      success: true, 
      user: userWithoutPassword 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== USERS ROUTES ==========
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, role, nom, prenom, actif, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, role, nom, prenom, actif, created_at, updated_at')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role, nom, prenom } = req.body;
    
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Nom d\'utilisateur requis' });
    }
    
    if (!password || !password.trim()) {
      return res.status(400).json({ error: 'Mot de passe requis' });
    }

    // Nettoyer les valeurs : convertir les chaînes vides en null
    const userData = {
      username: username.trim(),
      password: password.trim(),
      role: role || 'assistant',
      nom: nom && nom.trim() ? nom.trim() : null,
      prenom: prenom && prenom.trim() ? prenom.trim() : null
    };

    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select('id, username, role, nom, prenom, actif, created_at, updated_at')
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { password, role, nom, prenom, actif } = req.body;
    const updateData = {};
    
    if (password && password.trim()) updateData.password = password.trim();
    if (role) updateData.role = role;
    if (nom !== undefined) updateData.nom = nom && nom.trim() ? nom.trim() : null;
    if (prenom !== undefined) updateData.prenom = prenom && prenom.trim() ? prenom.trim() : null;
    if (actif !== undefined) updateData.actif = actif;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.params.id)
      .select('id, username, role, nom, prenom, actif, created_at, updated_at')
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== PATIENTS ROUTES ==========
app.get('/api/patients', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Patient supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/patients/search/:query', async (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const { data, error } = await supabase
      .from('patients')
      .select('*');
    
    if (error) throw error;
    
    const filtered = data.filter(patient => 
      patient.nom?.toLowerCase().includes(query) ||
      patient.prenom?.toLowerCase().includes(query) ||
      patient.cin?.toLowerCase().includes(query) ||
      patient.telephone?.includes(query)
    );
    
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== CONSULTATIONS ROUTES ==========
app.get('/api/consultations/:patientId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('patient_id', req.params.patientId)
      .order('date_consultation', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/consultations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/consultations/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/consultations/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Consultation supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== RENDEZ-VOUS ROUTES ==========
app.get('/api/rendezvous', async (req, res) => {
  try {
    const { date } = req.query;
    let query = supabase
      .from('rendezvous')
      .select('*')
      .order('date_rdv', { ascending: true })
      .order('heure_rdv', { ascending: true });
    
    if (date) {
      query = query.eq('date_rdv', date);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rendezvous', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rendezvous')
      .insert([req.body])
      .select('*')
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/rendezvous/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rendezvous')
      .update(req.body)
      .eq('id', req.params.id)
      .select('*')
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/rendezvous/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('rendezvous')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Rendez-vous supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== PAIEMENTS ROUTES ==========
app.get('/api/paiements/:patientId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('paiements')
      .select('*')
      .eq('patient_id', req.params.patientId)
      .order('date_paiement', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/paiements', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('paiements')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/paiements/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('paiements')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== CONTROLES ROUTES ==========
app.get('/api/controles', async (req, res) => {
  try {
    const { date } = req.query;
    let query = supabase
      .from('controles')
      .select('*, patients(*)')
      .order('date_controle', { ascending: true })
      .order('heure_controle', { ascending: true });
    
    if (date) {
      query = query.eq('date_controle', date);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/controles/:patientId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('controles')
      .select('*')
      .eq('patient_id', req.params.patientId)
      .order('date_controle', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/controles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('controles')
      .insert([req.body])
      .select('*, patients(*)')
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/controles/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('controles')
      .update(req.body)
      .eq('id', req.params.id)
      .select('*, patients(*)')
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/controles/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('controles')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Contrôle supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== STATISTICS ROUTES ==========
app.get('/api/statistics', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Consultations du jour
    const { data: consultationsToday, error: err1 } = await supabase
      .from('consultations')
      .select('id')
      .eq('date_consultation', today);
    
    if (err1) throw err1;
    
    // Nouveaux patients (ce mois)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { data: newPatients, error: err2 } = await supabase
      .from('patients')
      .select('id')
      .gte('created_at', startOfMonth.toISOString());
    
    if (err2) throw err2;
    
    // Rendez-vous du jour
    const { data: rdvToday, error: err3 } = await supabase
      .from('rendezvous')
      .select('*')
      .eq('date_rdv', today)
      .order('heure_rdv', { ascending: true });
    
    if (err3) throw err3;
    
    // Contrôles du jour
    const { data: controlesToday, error: err4 } = await supabase
      .from('controles')
      .select('*, patients(*)')
      .eq('date_controle', today)
      .order('heure_controle', { ascending: true });
    
    if (err4) throw err4;
    
    // Total patients
    const { count: totalPatients, error: err5 } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    
    if (err5) throw err5;
    
    res.json({
      consultationsToday: consultationsToday?.length || 0,
      newPatientsThisMonth: newPatients?.length || 0,
      rdvToday: rdvToday || [],
      controlesToday: controlesToday || [],
      totalPatients: totalPatients || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur Express démarré sur le port ${PORT}`);
});

