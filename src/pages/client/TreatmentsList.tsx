import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, Eye, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface Treatment {
  id: string;
  title: string;
  type: string;
  startDate: string;
  currentPhase: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  duration: string;
  timeElapsed: string;
  timeRemaining: string;
  lastUpdate: string;
}

const API_BASE_URL ='http://localhost:3000';

const TreatmentsList = () => {
  const { user } = useAuth();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      setError(null);


      const response = await fetch(`${API_BASE_URL}/api/client/treatments`, {
        headers: {
          'Content-Type': 'application/json',
   
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setTreatments(data);
    } catch (err) {
      console.error('Erro ao carregar tratamentos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast.error('Falha ao carregar tratamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  const getBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Ativo</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Concluído</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pausado</Badge>;
      default:
        return <Badge variant="outline">Outro</Badge>;
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-bravo-blue mb-2">Meus Tratamentos</h1>
          <p className="text-gray-600">Gerencie e acompanhe todos os seus tratamentos</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-bravo-blue mb-4" />
          <p className="text-gray-600">Carregando seus tratamentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-bravo-blue mb-2">Meus Tratamentos</h1>
          <p className="text-gray-600">Gerencie e acompanhe todos os seus tratamentos</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar tratamentos</h3>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <Button 
              variant="outline" 
              onClick={fetchTreatments}
              className="mx-auto"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (treatments.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-bravo-blue mb-2">Meus Tratamentos</h1>
          <p className="text-gray-600">Gerencie e acompanhe todos os seus tratamentos</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <Calendar className="h-8 w-8 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum tratamento encontrado</h3>
            <p className="text-sm text-gray-500">
              Seus tratamentos aparecerão aqui quando iniciados
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-bravo-blue mb-2">Meus Tratamentos</h1>
        <p className="text-gray-600">Gerencie e acompanhe todos os seus tratamentos</p>
      </div>
      
      <div className="grid gap-6">
        {treatments.map((treatment) => (
          <Card key={treatment.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 text-bravo-blue mr-2" />
                    {treatment.title}
                    <span className="ml-3">
                      {getBadge(treatment.status)}
                    </span>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {treatment.type} • Iniciado em {new Date(treatment.startDate).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </div>
                <Button asChild size="sm">
                  <Link to={`/cliente/tratamentos/${treatment.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Link>
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Fase Atual:</span>
                    <p className="font-semibold">{treatment.currentPhase}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Tempo Decorrido:</span>
                    <p className="font-semibold">{treatment.timeElapsed}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Última Atualização:</span>
                    <p className="font-semibold">
                      {new Date(treatment.lastUpdate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progresso do Tratamento</span>
                    <span>{treatment.progress}%</span>
                  </div>
                  <Progress value={treatment.progress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TreatmentsList;
