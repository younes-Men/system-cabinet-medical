import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, DollarSign, Plus, Edit, Trash2, Calendar, CheckCircle } from 'lucide-react';
import API_URL from '../config/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [controles, setControles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showControleModal, setShowControleModal] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState(null);
  const [editingPaiementNote, setEditingPaiementNote] = useState(null);
  const [editingControle, setEditingControle] = useState(null);
  const [noteForm, setNoteForm] = useState({ notes: '' });
  const [consultationForm, setConsultationForm] = useState({
    date_consultation: new Date().toISOString().split('T')[0],
    motif: '',
    diagnostic: '',
    traitement: '',
    notes: ''
  });
  const [paiementForm, setPaiementForm] = useState({
    date_paiement: new Date().toISOString().split('T')[0],
    montant: '',
    mode_paiement: 'espèces',
    notes: ''
  });
  const [controleForm, setControleForm] = useState({
    date_controle: new Date().toISOString().split('T')[0],
    heure_controle: '',
    motif: '',
    notes: ''
  });

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      // Fetch patient
      const patientRes = await fetch(`${API_URL}/patients/${id}`);
      const patientData = await patientRes.json();
      setPatient(patientData);

      // Fetch consultations
      const consultationsRes = await fetch(`${API_URL}/consultations/${id}`);
      const consultationsData = await consultationsRes.json();
      setConsultations(consultationsData);

      // Fetch paiements
      const paiementsRes = await fetch(`${API_URL}/paiements/${id}`);
      const paiementsData = await paiementsRes.json();
      setPaiements(paiementsData);

      // Fetch controles
      const controlesRes = await fetch(`${API_URL}/controles/${id}`);
      const controlesData = await controlesRes.json();
      setControles(controlesData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsultationSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingConsultation
        ? `${API_URL}/consultations/${editingConsultation.id}`
        : `${API_URL}/consultations`;
      
      const method = editingConsultation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...consultationForm,
          patient_id: id
        })
      });

      if (response.ok) {
        setShowConsultationModal(false);
        setEditingConsultation(null);
        setConsultationForm({
          date_consultation: new Date().toISOString().split('T')[0],
          motif: '',
          diagnostic: '',
          traitement: '',
          notes: ''
        });
        fetchPatientData();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la consultation');
    }
  };

  const handlePaiementSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/paiements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paiementForm,
          patient_id: id,
          montant: parseFloat(paiementForm.montant)
        })
      });

      if (response.ok) {
        setShowPaiementModal(false);
        setPaiementForm({
          date_paiement: new Date().toISOString().split('T')[0],
          montant: '',
          mode_paiement: 'espèces',
          notes: ''
        });
        fetchPatientData();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de l\'enregistrement du paiement');
    }
  };

  const handleDeleteConsultation = async (consultationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette consultation ?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/consultations/${consultationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchPatientData();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleEditConsultation = (consultation) => {
    setEditingConsultation(consultation);
    setConsultationForm({
      date_consultation: consultation.date_consultation || new Date().toISOString().split('T')[0],
      motif: consultation.motif || '',
      diagnostic: consultation.diagnostic || '',
      traitement: consultation.traitement || '',
      notes: consultation.notes || ''
    });
    setShowConsultationModal(true);
  };

  const handleEditPaiementNote = (paiement) => {
    setEditingPaiementNote(paiement);
    setNoteForm({ notes: paiement.notes || '' });
    setShowNoteModal(true);
  };

  const handleUpdatePaiementNote = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/paiements/${editingPaiementNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteForm.notes })
      });

      if (response.ok) {
        setShowNoteModal(false);
        setEditingPaiementNote(null);
        setNoteForm({ notes: '' });
        fetchPatientData();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour de la note');
    }
  };

  const handleDeletePaiementNote = async (paiementId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/paiements/${paiementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: null })
      });

      if (response.ok) {
        fetchPatientData();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la note');
    }
  };

  const handleControleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingControle
        ? `${API_URL}/controles/${editingControle.id}`
        : `${API_URL}/controles`;
      
      const method = editingControle ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...controleForm,
          patient_id: id
        })
      });

      if (response.ok) {
        setShowControleModal(false);
        setEditingControle(null);
        setControleForm({
          date_controle: new Date().toISOString().split('T')[0],
          heure_controle: '',
          motif: '',
          notes: ''
        });
        fetchPatientData();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du contrôle');
    }
  };

  const handleEditControle = (controle) => {
    setEditingControle(controle);
    setControleForm({
      date_controle: controle.date_controle || new Date().toISOString().split('T')[0],
      heure_controle: controle.heure_controle || '',
      motif: controle.motif || '',
      notes: controle.notes || ''
    });
    setShowControleModal(true);
  };

  const handleDeleteControle = async (controleId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce contrôle ?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/controles/${controleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchPatientData();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  if (!patient) {
    return <div className="text-center py-12">Patient non trouvé</div>;
  }

  const totalPaiements = paiements.reduce((sum, p) => sum + (parseFloat(p.montant) || 0), 0);

  return (
    <div>
      <button
        onClick={() => navigate('/patients')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Retour à la liste
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Dossier Médical - {patient.nom} {patient.prenom}
      </h1>

      {/* Informations du patient */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Informations Personnelles</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">CIN</p>
            <p className="font-semibold">{patient.cin}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Téléphone</p>
            <p className="font-semibold">{patient.telephone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date de naissance</p>
            <p className="font-semibold">
              {patient.date_naissance ? format(new Date(patient.date_naissance), 'dd MMMM yyyy', { locale: fr }) : '-'}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600">Adresse</p>
            <p className="font-semibold">{patient.adresse || '-'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary-600" />
              Consultations ({consultations.length})
            </h2>
            <button
              onClick={() => {
                setEditingConsultation(null);
                setConsultationForm({
                  date_consultation: new Date().toISOString().split('T')[0],
                  motif: '',
                  diagnostic: '',
                  traitement: '',
                  notes: ''
                });
                setShowConsultationModal(true);
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Nouvelle
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {consultations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune consultation enregistrée</p>
            ) : (
              consultations.map((consultation) => (
                <div key={consultation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-primary-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {format(new Date(consultation.date_consultation), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{consultation.motif || 'Consultation'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditConsultation(consultation)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteConsultation(consultation.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {consultation.diagnostic && (
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-medium">Diagnostic:</span> {consultation.diagnostic}
                    </p>
                  )}
                  {consultation.traitement && (
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">Traitement:</span> {consultation.traitement}
                    </p>
                  )}
                  {consultation.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">{consultation.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Paiements */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-primary-600" />
              Paiements ({paiements.length})
            </h2>
            <button
              onClick={() => setShowPaiementModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Nouveau
            </button>
          </div>

          <div className="mb-4 p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-gray-600">Total payé</p>
            <p className="text-2xl font-bold text-primary-600">{totalPaiements.toFixed(2)} MAD</p>
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto">
            {paiements.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun paiement enregistré</p>
            ) : (
              paiements.map((paiement) => (
                <div key={paiement.id} className="border border-gray-200 rounded-lg p-4 hover:bg-primary-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {format(new Date(paiement.date_paiement), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {paiement.mode_paiement}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-primary-600">
                      {parseFloat(paiement.montant).toFixed(2)} MAD
                    </p>
                  </div>
                  {paiement.notes && (
                    <div className="flex items-start justify-between gap-2 mt-2">
                      <p className="text-sm text-gray-600 italic flex-1">{paiement.notes}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPaiementNote(paiement)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Modifier la note"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePaiementNote(paiement.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Supprimer la note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contrôles */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary-600" />
              Contrôles ({controles.length})
            </h2>
            <button
              onClick={() => {
                setEditingControle(null);
                setControleForm({
                  date_controle: new Date().toISOString().split('T')[0],
                  heure_controle: '',
                  motif: '',
                  notes: ''
                });
                setShowControleModal(true);
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Nouveau
            </button>
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto">
            {controles.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun contrôle enregistré</p>
            ) : (
              controles.map((controle) => (
                <div key={controle.id} className="border border-gray-200 rounded-lg p-4 hover:bg-primary-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {format(new Date(controle.date_controle), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {controle.heure_controle} - {controle.motif || 'Contrôle'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditControle(controle)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteControle(controle.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {controle.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">{controle.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Consultation */}
      {showConsultationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingConsultation ? 'Modifier la Consultation' : 'Nouvelle Consultation'}
            </h2>
            
            <form onSubmit={handleConsultationSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Date de consultation *
                  </label>
                  <input
                    type="date"
                    required
                    value={consultationForm.date_consultation}
                    onChange={(e) => setConsultationForm({ ...consultationForm, date_consultation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Motif *
                  </label>
                  <input
                    type="text"
                    required
                    value={consultationForm.motif}
                    onChange={(e) => setConsultationForm({ ...consultationForm, motif: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Diagnostic
                </label>
                <textarea
                  value={consultationForm.diagnostic}
                  onChange={(e) => setConsultationForm({ ...consultationForm, diagnostic: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Traitement
                </label>
                <textarea
                  value={consultationForm.traitement}
                  onChange={(e) => setConsultationForm({ ...consultationForm, traitement: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Notes
                </label>
                <textarea
                  value={consultationForm.notes}
                  onChange={(e) => setConsultationForm({ ...consultationForm, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  {editingConsultation ? 'Modifier' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConsultationModal(false);
                    setEditingConsultation(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Paiement */}
      {showPaiementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nouveau Paiement</h2>
            
            <form onSubmit={handlePaiementSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Date de paiement *
                </label>
                <input
                  type="date"
                  required
                  value={paiementForm.date_paiement}
                  onChange={(e) => setPaiementForm({ ...paiementForm, date_paiement: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Montant (MAD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paiementForm.montant}
                  onChange={(e) => setPaiementForm({ ...paiementForm, montant: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Mode de paiement *
                </label>
                <select
                  required
                  value={paiementForm.mode_paiement}
                  onChange={(e) => setPaiementForm({ ...paiementForm, mode_paiement: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="espèces">Espèces</option>
                  <option value="carte bancaire">Carte bancaire</option>
                  <option value="chèque">Chèque</option>
                  <option value="virement">Virement</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Notes
                </label>
                <textarea
                  value={paiementForm.notes}
                  onChange={(e) => setPaiementForm({ ...paiementForm, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaiementModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modification Note Paiement */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Modifier la Note</h2>
            
            <form onSubmit={handleUpdatePaiementNote} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Note
                </label>
                <textarea
                  value={noteForm.notes}
                  onChange={(e) => setNoteForm({ notes: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Entrez la note..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNoteModal(false);
                    setEditingPaiementNote(null);
                    setNoteForm({ notes: '' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Contrôle */}
      {showControleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingControle ? 'Modifier le Contrôle' : 'Nouveau Contrôle'}
            </h2>
            
            <form onSubmit={handleControleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Date de contrôle *
                  </label>
                  <input
                    type="date"
                    required
                    value={controleForm.date_controle}
                    onChange={(e) => setControleForm({ ...controleForm, date_controle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Heure *
                  </label>
                  <input
                    type="time"
                    required
                    value={controleForm.heure_controle}
                    onChange={(e) => setControleForm({ ...controleForm, heure_controle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Motif
                </label>
                <input
                  type="text"
                  value={controleForm.motif}
                  onChange={(e) => setControleForm({ ...controleForm, motif: e.target.value })}
                  placeholder="Ex: Contrôle post-opératoire, Suivi traitement..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Notes
                </label>
                <textarea
                  value={controleForm.notes}
                  onChange={(e) => setControleForm({ ...controleForm, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  {editingControle ? 'Modifier' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowControleModal(false);
                    setEditingControle(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientDetail;

