import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Eye, UserPlus, Download } from 'lucide-react';
import API_URL from '../config/api';
import exportLPatient from '../lib/exportPatientExcelFile';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    cin: '',
    telephone: '',
    date_naissance: '',
    adresse: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_URL}/patients`);
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPatients();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/patients/search/${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingPatient 
        ? `${API_URL}/patients/${editingPatient.id}`
        : `${API_URL}/patients`;
      
      const method = editingPatient ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setEditingPatient(null);
        setFormData({
          nom: '',
          prenom: '',
          cin: '',
          telephone: '',
          date_naissance: '',
          adresse: ''
        });
        fetchPatients();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du patient');
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      nom: patient.nom || '',
      prenom: patient.prenom || '',
      cin: patient.cin || '',
      telephone: patient.telephone || '',
      date_naissance: patient.date_naissance || '',
      adresse: patient.adresse || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/patients/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchPatients();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du patient');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch(`${API_URL}/export/patients`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      // Récupérer le blob
      const blob = await response.blob();
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extraire le nom du fichier depuis les headers ou utiliser un nom par défaut
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = 'patients_export.xlsx';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('Export Excel réussi ! Le fichier a été téléchargé.');
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      alert('Erreur lors de l\'export Excel: ' + error.message);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.prenom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.cin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.telephone?.includes(searchQuery)
  );

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Patients</h1>
        <div className="flex gap-3">
          <button
            onClick={()=> exportLPatient()}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
          >
            <Download className="w-5 h-5" />
            Exporter en Excel
          </button>
          <button
            onClick={() => {
              setEditingPatient(null);
              setFormData({
                nom: '',
                prenom: '',
                cin: '',
                telephone: '',
                date_naissance: '',
                adresse: ''
              });
              setShowModal(true);
            }}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-md"
          >
            <UserPlus className="w-5 h-5" />
            Nouveau Patient
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, CIN ou téléphone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() === '') {
                  fetchPatients();
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Rechercher
          </button>
        </div>
      </div>

      {/* Liste des patients */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucun patient trouvé
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-primary-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Nom</th>
                <th className="px-6 py-4 text-left">Prénom</th>
                <th className="px-6 py-4 text-left">CIN</th>
                <th className="px-6 py-4 text-left">Téléphone</th>
                <th className="px-6 py-4 text-left">Date de naissance</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-200 hover:bg-primary-50 transition-colors">
                  <td className="px-6 py-4">{patient.nom}</td>
                  <td className="px-6 py-4">{patient.prenom}</td>
                  <td className="px-6 py-4">{patient.cin}</td>
                  <td className="px-6 py-4">{patient.telephone}</td>
                  <td className="px-6 py-4">
                    {patient.date_naissance ? new Date(patient.date_naissance).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <Link
                        to={`/patients/${patient.id}`}
                        className="p-2 text-primary-600 hover:bg-primary-100 rounded transition-colors"
                        title="Voir le dossier"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleEdit(patient)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingPatient ? 'Modifier le Patient' : 'Nouveau Patient'}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    CIN
                  </label>
                  <input
                    type="text"
                    value={formData.cin}
                    onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={formData.date_naissance}
                  onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Adresse
                </label>
                <textarea
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  {editingPatient ? 'Modifier' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPatient(null);
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

export default Patients;

