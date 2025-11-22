import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Clock, User } from 'lucide-react';
import API_URL from '../config/api';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

function RendezVous() {
  const [rendezvous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingRdv, setEditingRdv] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    date_rdv: new Date().toISOString().split('T')[0],
    heure_rdv: '',
    motif: '',
    notes: ''
  });

  useEffect(() => {
    fetchRendezVous();
  }, [selectedDate]);

  const fetchRendezVous = async () => {
    try {
      const response = await fetch(`${API_URL}/rendezvous?date=${selectedDate}`);
      const data = await response.json();
      setRendezVous(data);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingRdv
        ? `${API_URL}/rendezvous/${editingRdv.id}`
        : `${API_URL}/rendezvous`;
      
      const method = editingRdv ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setEditingRdv(null);
        setFormData({
          nom: '',
          prenom: '',
          telephone: '',
          date_rdv: selectedDate,
          heure_rdv: '',
          motif: '',
          notes: ''
        });
        fetchRendezVous();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du rendez-vous');
    }
  };

  const handleEdit = (rdv) => {
    setEditingRdv(rdv);
    setFormData({
      nom: rdv.nom || '',
      prenom: rdv.prenom || '',
      telephone: rdv.telephone || '',
      date_rdv: rdv.date_rdv,
      heure_rdv: rdv.heure_rdv,
      motif: rdv.motif || '',
      notes: rdv.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/rendezvous/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchRendezVous();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du rendez-vous');
    }
  };

  // Grouper les rendez-vous par heure
  const groupedRdv = rendezvous.reduce((acc, rdv) => {
    const heure = rdv.heure_rdv;
    if (!acc[heure]) {
      acc[heure] = [];
    }
    acc[heure].push(rdv);
    return acc;
  }, {});

  const heures = Object.keys(groupedRdv).sort();

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Rendez-vous</h1>
        <button
          onClick={() => {
            setEditingRdv(null);
            setFormData({
              nom: '',
              prenom: '',
              telephone: '',
              date_rdv: selectedDate,
              heure_rdv: '',
              motif: '',
              notes: ''
            });
            setShowModal(true);
          }}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nouveau Rendez-vous
        </button>
      </div>

      {/* Sélecteur de date */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-6 h-6 text-primary-600" />
          <label className="text-gray-700 font-medium">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setFormData({ ...formData, date_rdv: e.target.value });
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
          <span className="text-gray-600">
            {format(parseISO(selectedDate), 'EEEE dd MMMM yyyy', { locale: fr })}
          </span>
        </div>
      </div>

      {/* Calendrier journalier */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-primary-600" />
          Rendez-vous du jour ({rendezvous.length})
        </h2>

        {rendezvous.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>Aucun rendez-vous prévu pour cette date</p>
          </div>
        ) : (
          <div className="space-y-6">
            {heures.map((heure) => (
              <div key={heure} className="border-l-4 border-primary-600 pl-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  {heure}
                </h3>
                <div className="space-y-3 ml-7">
                  {groupedRdv[heure].map((rdv) => (
                    <div
                      key={rdv.id}
                      className="bg-primary-50 border border-primary-200 rounded-lg p-4 hover:bg-primary-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-5 h-5 text-primary-600" />
                            <h4 className="font-semibold text-gray-800 text-lg">
                              {rdv.nom} {rdv.prenom}
                            </h4>
                          </div>
                          {rdv.telephone && (
                            <p className="text-gray-700 mb-1">
                              <span className="font-medium">📞 Tél:</span> {rdv.telephone}
                            </p>
                          )}
                          {rdv.motif && (
                            <p className="text-gray-700 mb-1">
                              <span className="font-medium">Motif:</span> {rdv.motif}
                            </p>
                          )}
                          {rdv.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">{rdv.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(rdv)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rdv.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingRdv ? 'Modifier le Rendez-vous' : 'Nouveau Rendez-vous'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="Ex: 0612345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date_rdv}
                    onChange={(e) => setFormData({ ...formData, date_rdv: e.target.value })}
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
                    value={formData.heure_rdv}
                    onChange={(e) => setFormData({ ...formData, heure_rdv: e.target.value })}
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
                  value={formData.motif}
                  onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                  placeholder="Ex: Consultation générale, Suivi..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  {editingRdv ? 'Modifier' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRdv(null);
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

export default RendezVous;

