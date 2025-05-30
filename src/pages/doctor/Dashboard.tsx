
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Clock, Calendar, User } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  
  // Mock data for patients awaiting evaluation
  const pendingEvaluations = [
    {
      id: '1',
      name: 'João Silva',
      age: 32,
      date: '2023-03-25T14:30:00',
      type: 'queda-capilar',
      priority: 'normal'
    },
    {
      id: '2',
      name: 'Marcos Oliveira',
      age: 45,
      date: '2023-03-25T10:15:00',
      type: 'disfuncao-eretil',
      priority: 'high'
    },
    {
      id: '3',
      name: 'André Costa',
      age: 28,
      date: '2023-03-24T16:45:00',
      type: 'queda-capilar',
      priority: 'normal'
    },
    {
      id: '4',
      name: 'Ricardo Mendes',
      age: 37,
      date: '2023-03-24T09:20:00',
      type: 'disfuncao-eretil',
      priority: 'normal'
    },
  ];
  
  // Mock data for recent evaluations
  const recentEvaluations = [
    {
      id: '5',
      name: 'Carlos Eduardo',
      age: 41,
      date: '2023-03-23T15:10:00',
      type: 'disfuncao-eretil'
    },
    {
      id: '6',
      name: 'Paulo Vieira',
      age: 35,
      date: '2023-03-23T11:30:00',
      type: 'queda-capilar'
    },
    {
      id: '7',
      name: 'Gustavo Martins',
      age: 29,
      date: '2023-03-22T14:45:00',
      type: 'queda-capilar'
    },
  ];
  
  // Dashboard stats
  const stats = [
    {
      title: 'Avaliações pendentes',
      value: 4,
      change: '+2 hoje',
      changeType: 'increase'
    },
    {
      title: 'Avaliações concluídas',
      value: 32,
      change: '+3 hoje',
      changeType: 'neutral'
    },
    {
      title: 'Tempo médio de resposta',
      value: '2.3h',
      change: '-10min',
      changeType: 'decrease'
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-bravo-blue">
          Painel do Médico
        </h1>
        
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link to="/medico/historico">
              Ver histórico completo
              <ArrowRight className="ml-2" size={16} />
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">
                  {stat.title}
                </span>
                <div className="flex items-baseline mt-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </span>
                  <span className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 
                    stat.changeType === 'decrease' ? 'text-red-600' : 
                    'text-gray-500'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Patient Queue */}
      <div className="mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Fila de Avaliação</CardTitle>
            <CardDescription>
              Pacientes aguardando avaliação médica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="hair">Queda Capilar</TabsTrigger>
                <TabsTrigger value="ed">Disfunção Erétil</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="space-y-4">
                  {pendingEvaluations.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-gray-200 transition-all">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium">{patient.name}</h3>
                          <span className="text-sm text-gray-500 ml-2">{patient.age} anos</span>
                          {patient.priority === 'high' && (
                            <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-200">Urgente</Badge>
                          )}
                          <Badge className="ml-2" variant="outline">
                            {patient.type === 'queda-capilar' ? 'Queda Capilar' : 'Disfunção Erétil'}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock size={14} className="mr-1" />
                          <span>Enviado em {new Date(patient.date).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                      <Button asChild>
                        <Link to={`/medico/paciente/${patient.id}`}>
                          Avaliar
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="hair">
                <div className="space-y-4">
                  {pendingEvaluations
                    .filter(p => p.type === 'queda-capilar')
                    .map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-gray-200 transition-all">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-medium">{patient.name}</h3>
                            <span className="text-sm text-gray-500 ml-2">{patient.age} anos</span>
                            {patient.priority === 'high' && (
                              <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-200">Urgente</Badge>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock size={14} className="mr-1" />
                            <span>Enviado em {new Date(patient.date).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                        <Button asChild>
                          <Link to={`/medico/paciente/${patient.id}`}>
                            Avaliar
                          </Link>
                        </Button>
                      </div>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="ed">
                <div className="space-y-4">
                  {pendingEvaluations
                    .filter(p => p.type === 'disfuncao-eretil')
                    .map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-gray-200 transition-all">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-medium">{patient.name}</h3>
                            <span className="text-sm text-gray-500 ml-2">{patient.age} anos</span>
                            {patient.priority === 'high' && (
                              <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-200">Urgente</Badge>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock size={14} className="mr-1" />
                            <span>Enviado em {new Date(patient.date).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                        <Button asChild>
                          <Link to={`/medico/paciente/${patient.id}`}>
                            Avaliar
                          </Link>
                        </Button>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Evaluations */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Avaliações Recentes</CardTitle>
            <CardDescription>
              Últimos pacientes avaliados
            </CardDescription>
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
              <Link to="/medico/historico">
                Ver todos os pacientes
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;
