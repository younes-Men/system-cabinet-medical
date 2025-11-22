import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Lock, Unlock, Shield } from 'lucide-react';
import API_URL from '../config/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'assistant',
    nom: '',
    prenom: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation pour nouveau utilisateur
    if (!editingUser) {
      if (!formData.username || !formData.password) {
        alert('Le nom d\'utilisateur et le mot de passe sont requis');
        return;
      }
    }
    
    try {
      const url = editingUser 
        ? `${API_URL}/users/${editingUser.id}`
        : `${API_URL}/users`;
      
      const method = editingUser ? 'PUT' : 'POST';
      
      // Préparer le body en nettoyant les champs vides
      let body;
      if (editingUser) {
        // Pour la modification, ne pas envoyer password si vide
        body = {
          role: formData.role,
          nom: formData.nom || null,
          prenom: formData.prenom || null
        };
        if (formData.password && formData.password.trim() !== '') {
          body.password = formData.password;
        }
      } else {
        // Pour l'ajout, envoyer tous les champs requis
        body = {
          username: formData.username.trim(),
          password: formData.password,
          role: formData.role || 'assistant',
          nom: formData.nom?.trim() || null,
          prenom: formData.prenom?.trim() || null
        };
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const responseData = await response.json();

      if (response.ok) {
        setShowModal(false);
        setEditingUser(null);
        setFormData({
          username: '',
          password: '',
          role: 'assistant',
          nom: '',
          prenom: ''
        });
        fetchUsers();
        alert(editingUser ? 'Utilisateur modifié avec succès' : 'Utilisateur ajouté avec succès');
      } else {
        alert(responseData.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'utilisateur: ' + error.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
      nom: user.nom || '',
      prenom: user.prenom || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleToggleActif = async (user) => {
    try {
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: !user.actif })
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({
              username: '',
              password: '',
              role: 'assistant',
              nom: '',
              prenom: ''
            });
            setShowModal(true);
          }}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-md"
        >
          <UserPlus className="w-5 h-5" />
          Nouvel Utilisateur
        </button>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucun utilisateur trouvé
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-primary-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Nom d'utilisateur</th>
                <th className="px-6 py-4 text-left">Nom</th>
                <th className="px-6 py-4 text-left">Prénom</th>
                <th className="px-6 py-4 text-left">Rôle</th>
                <th className="px-6 py-4 text-left">Statut</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-primary-50 transition-colors">
                  <td className="px-6 py-4 font-semibold">{user.username}</td>
                  <td className="px-6 py-4">{user.nom || '-'}</td>
                  <td className="px-6 py-4">{user.prenom || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === 'docteur' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      <Shield className="w-4 h-4" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.actif 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleToggleActif(user)}
                        className={`p-2 rounded transition-colors ${
                          user.actif
                            ? 'text-orange-600 hover:bg-orange-100'
                            : 'text-primary-600 hover:bg-primary-100'
                        }`}
                        title={user.actif ? 'Désactiver' : 'Activer'}
                      >
                        {user.actif ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
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
              {editingUser ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Nom d'utilisateur *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={editingUser !== null}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Rôle *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="assistant">Assistant</option>
                  <option value="docteur">Docteur</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  {editingUser ? 'Modifier' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    setFormData({
                      username: '',
                      password: '',
                      role: 'assistant',
                      nom: '',
                      prenom: ''
                    });
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

export default Users;

