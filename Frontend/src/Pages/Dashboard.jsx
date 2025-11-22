import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import API_URL from '../config/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

function Dashboard() {
  const [stats, setStats] = useState({
    consultationsToday: 0,
    newPatientsThisMonth: 0,
    rdvToday: [],
    controlesToday: [],
    totalPatients: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_URL}/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Tableau de bord</h1>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Consultations aujourd'hui</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {stats.consultationsToday}
              </p>
            </div>
            <FileText className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Nouveaux patients (mois)</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {stats.newPatientsThisMonth}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total patients</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {stats.totalPatients}
              </p>
            </div>
            <Users className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Rendez-vous aujourd'hui</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {stats.rdvToday.length}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-primary-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Rendez-vous du jour */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-primary-600" />
              Rendez-vous d'aujourd'hui
            </h2>
            <Link
              to="/rendezvous"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Voir tout →
            </Link>
          </div>

          {stats.rdvToday.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun rendez-vous prévu pour aujourd'hui
            </p>
          ) : (
            <div className="space-y-4">
              {stats.rdvToday.map((rdv) => (
                <div
                  key={rdv.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {rdv.nom} {rdv.prenom}
                      </h3>
                      {rdv.telephone && (
                        <p className="text-sm text-gray-600 mt-1">
                          📞 {rdv.telephone}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-600">
                        {rdv.heure_rdv}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(rdv.date_rdv), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contrôles du jour */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-primary-600" />
              Contrôles d'aujourd'hui
            </h2>
            <Link
              to="/controles"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Voir tout →
            </Link>
          </div>

          {stats.controlesToday?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun contrôle prévu pour aujourd'hui
            </p>
          ) : (
            <div className="space-y-4">
              {stats.controlesToday?.map((controle) => (
                <div
                  key={controle.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {controle.patients?.nom} {controle.patients?.prenom}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {controle.motif || 'Contrôle'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-600">
                        {controle.heure_controle}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(controle.date_controle), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;

