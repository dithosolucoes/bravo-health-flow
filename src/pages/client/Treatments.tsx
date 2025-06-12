import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Camera, TrendingUp, Clock, FileText, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface TreatmentEvolution {
  id: string;
  startDate: string;
  currentPhase: string;
  progress: number;
  totalDuration: string;
  timeElapsed: string;
  timeRemaining: string;
  photos: {
    id: string;
    date: string;
    description: string;
    imageUrl: string;
  }[];
  milestones: {
    id: string;
    date: string;
    title: string;
    description: string;
    completed: boolean;
  }[];
}

const API_BASE_URL = 'https://bravo-backend-production.up.railway.app';

const ClientTreatments = () => {
  const { user } = useAuth();
  const [treatmentData, setTreatmentData] = useState<TreatmentEvolution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTreatmentEvolution = async () => {
    try {
      setLoading(true);
      setError(null);

      
      const response = await fetch(`${API_BASE_URL}/treatment-evolution`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data: TreatmentEvolution = await response.json();
      setTreatmentData(data);
    } catch (err) {
      console.error('Erro ao carregar evolução do tratamento:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast.error('Falha ao carregar evolução do tratamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatmentEvolution();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-bravo-blue mb-2">Evolução do Tratamento</h1>
          <p className="text-gray-600">Acompanhe o progresso do seu tratamento com fotos e marcos importantes</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-bravo-blue mb-4" />
          <p className="text-gray-600">Carregando evolução do tratamento...</p>
        </div>
      </div>
    );
  }

  if (error || !treatmentData) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-bravo-blue mb-2">Evolução do Tratamento</h1>
          <p className="text-gray-600">Acompanhe o progresso do seu tratamento com fotos e marcos importantes</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dados</h3>
            <p className="text-sm text-gray-500 mb-6">{error || 'Dados não encontrados'}</p>
            <Button 
              variant="outline" 
              onClick={fetchTreatmentEvolution}
              className="mx-auto"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-bravo-blue mb-2">Evolução do Tratamento</h1>
        <p className="text-gray-600">Acompanhe o progresso do seu tratamento com fotos e marcos importantes</p>
      </div>

      {/* Status Geral */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Status do Tratamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Fase Atual</h3>
              <p className="font-semibold text-lg">{treatmentData.currentPhase}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Tempo Decorrido</h3>
              <p className="font-semibold text-lg">{treatmentData.timeElapsed}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Tempo Restante</h3>
              <p className="font-semibold text-lg">{treatmentData.timeRemaining}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Duração Total</h3>
              <p className="font-semibold text-lg">{treatmentData.totalDuration}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progresso do Tratamento</span>
              <span>{treatmentData.progress}%</span>
            </div>
            <Progress value={treatmentData.progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Fotos da Evolução */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-5 w-5 mr-2 text-blue-600" />
            Fotos da Evolução
          </CardTitle>
          <CardDescription>
            Acompanhe visualmente o progresso do seu tratamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {treatmentData.photos.map((photo) => (
              <div key={photo.id} className="space-y-2">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.description}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{photo.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(photo.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline de Marcos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-purple-600" />
            Marcos do Tratamento
          </CardTitle>
          <CardDescription>
            Principais etapas e conquistas do seu tratamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-6 bottom-0 w-0.5 bg-gray-200" />
            
            <div className="space-y-6">
              {treatmentData.milestones.map((milestone) => (
                <div key={milestone.id} className="relative flex items-start">
                  <div className={`absolute left-0 top-4 -ml-1 w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 ${
                    milestone.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'bg-white border-gray-300'
                  }`}>
                    {milestone.completed && (
                      <div className="w-3 h-3 bg-white rounded-full" />
                    )}
                  </div>
                  
                  <div className="ml-12 pt-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="font-medium">{milestone.title}</h3>
                      {milestone.completed ? (
                        <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{milestone.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(milestone.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Ver Prescrições</CardTitle>
            <CardDescription>
              Consulte suas prescrições médicas e medicamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link to="/cliente/prescricoes">
                <FileText className="h-4 w-4 mr-2" />
                Ver Prescrições
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Histórico Completo</CardTitle>
            <CardDescription>
              Veja todo o histórico de consultas e avaliações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/cliente/historico">
                <Calendar className="h-4 w-4 mr-2" />
                Ver Histórico
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientTreatments;
