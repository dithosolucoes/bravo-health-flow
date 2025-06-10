import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, User, Clock, Users, ClipboardList, UserCheck } from 'lucide-react';

interface Evaluation {
  id: string;
  name: string;
  age: number;
  date: string;
  type: string;
}

interface Stat {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
}

const API_BASE_URL ='http://localhost:3000';

const DoctorDashboard = () => {
  const { user } = useAuth();

  // States para dados reais
  const [recentEvaluations, setRecentEvaluations] = useState<Evaluation[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Requisição para as estatísticas
        const statsRes = await fetch(`${API_BASE_URL}/api/doctor/stats`);
        const statsData: Stat[] = await statsRes.json();

        // Requisição para avaliações recentes
        const evalRes = await fetch(`${API_BASE_URL}/api/doctor/recent-evaluations`);
        const evalData: Evaluation[] = await evalRes.json();

        // Atualiza estado
        setStats(statsData);
        setRecentEvaluations(evalData);

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Carregando dados...</div>;
  }

  // Quick access (se precisar pegar dados dinâmicos, pode fazer outra requisição)
  const quickActions = [
    {
      title: 'Fila de Avaliação',
      description: 'Avaliar pacientes aguardando',
      icon: Clock,
      path: '/medico/avaliacao',
      count: stats.find(s => s.title === 'Avaliações pendentes')?.value || 0,
      color: 'text-blue-600'
    },
    {
      title: 'Prescrições',
      description: 'Gerenciar prescrições médicas',
      icon: ClipboardList,
      path: '/medico/prescricoes',
      count: null,
      color: 'text-green-600'
    },
    {
      title: 'Histórico',
      description: 'Ver histórico de pacientes',
      icon: Users,
      path: '/medico/historico',
      count: null,
      color: 'text-purple-600'
    },
    {
      title: 'Meu Perfil',
      description: 'Atualizar informações pessoais',
      icon: UserCheck,
      path: '/medico/perfil',
      count: null,
      color: 'text-orange-600'
    }
  ];

  return (
    <div>
      {/* título e botão */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-bravo-blue">Painel do Médico</h1>
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link to="/medico/historico">
              Ver histórico completo
              <ArrowRight className="ml-2" size={16} />
            </Link>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">{stat.title}</span>
                <div className="flex items-baseline mt-1">
                  <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                  <span className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' :
                    stat.changeType === 'decrease' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>{stat.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Acesso rápido */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link key={action.path} to={action.path} className="block group hover:bg-gray-50 p-4 rounded-lg border transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-white ${action.color}`}>
                      <action.icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 group-hover:text-bravo-blue">{action.title}</h3>
                        {action.count !== null && (
                          <Badge variant="outline">{action.count}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-bravo-blue" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Avaliações recentes */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Avaliações Recentes</CardTitle>
            <CardDescription>Últimos pacientes avaliados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvaluations.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <User size={16} className="mr-2 text-gray-400" />
                      <h3 className="font-medium">{patient.name}</h3>
                      <span className="text-sm text-gray-500 ml-2">{patient.age} anos</span>
                      <Badge className="ml-2" variant="outline">
                        {patient.type === 'queda-capilar' ? 'Queda Capilar' : 'Disfunção Erétil'}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar size={14} className="mr-1" />
                      <span>Avaliado em {new Date(patient.date).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to={`/medico/paciente/${patient.id}`}>
                      Ver detalhes
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t border-gray-100 pt-4">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/medico/historico">Ver todos os pacientes</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;
