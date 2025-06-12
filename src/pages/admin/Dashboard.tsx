import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Clock, User, Users, FileText, DollarSign, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_URL = 'https://bravo-backend-production.up.railway.app';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    {
      title: 'Total de Usuários',
      value: 0,
      change: '+0% este mês',
      changeType: 'increase' as const,
      icon: <Users size={24} />
    },
    {
      title: 'Prescrições Ativas',
      value: 0,
      change: '+0 hoje',
      changeType: 'increase' as const,
      icon: <FileText size={24} />
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 0',
      change: '+0% este mês',
      changeType: 'increase' as const,
      icon: <DollarSign size={24} />
    }
  ]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch stats
        const statsResponse = await fetch(`${API_URL}/dashboard/stats`);
        if (!statsResponse.ok) {
          throw new Error('Erro ao carregar estatísticas');
        }
        const statsData = await statsResponse.json();
        
        setStats([
          {
            title: 'Total de Usuários',
            value: statsData.totalUsers,
            change: `${statsData.userChange >= 0 ? '+' : ''}${statsData.userChange}% este mês`,
            changeType: statsData.userChange >= 0 ? 'increase' : 'decrease',
            icon: <Users size={24} />
          },
          {
            title: 'Prescrições Ativas',
            value: statsData.activePrescriptions,
            change: `${statsData.prescriptionsChange >= 0 ? '+' : ''}${statsData.prescriptionsChange} hoje`,
            changeType: statsData.prescriptionsChange >= 0 ? 'increase' : 'decrease',
            icon: <FileText size={24} />
          },
          {
            title: 'Receita Mensal',
            value: `R$ ${statsData.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            change: `${statsData.revenueChange >= 0 ? '+' : ''}${statsData.revenueChange}% este mês`,
            changeType: statsData.revenueChange >= 0 ? 'increase' : 'decrease',
            icon: <DollarSign size={24} />
          }
        ]);

        // Fetch activities
        const activitiesResponse = await fetch(`${API_URL}/dashboard/activities`);
        if (!activitiesResponse.ok) {
          throw new Error('Erro ao carregar atividades');
        }
        const activitiesData = await activitiesResponse.json();
        setRecentActivities(activitiesData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-bravo-blue">
          Painel Administrativo
        </h1>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/configuracoes">
              Configurações
              <ArrowRight className="ml-2" size={16} />
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </span>
                  <div className="flex items-baseline mt-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {loading ? 'Carregando...' : stat.value}
                    </span>
                  </div>
                  <span className={`text-sm mt-1 ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {loading ? '...' : stat.change}
                  </span>
                </div>
                <div className="bg-bravo-beige bg-opacity-30 p-3 rounded-full">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>
            Últimas atividades na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Carregando atividades...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                    <div className="bg-bravo-blue bg-opacity-10 p-2 rounded-full">
                      <Clock size={16} className="text-bravo-blue" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p>Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Ver todas as atividades
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminDashboard;