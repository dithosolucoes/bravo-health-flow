import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Camera, TrendingUp, Clock, Loader2, AlertCircle, ArrowLeft, RefreshCw, Upload } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface Photo {
  id: string;
  imageUrl: string;
  description: string;
  date: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
}

interface TreatmentEvolution {
  id: string;
  title: string;
  currentPhase: string;
  timeElapsed: string;
  timeRemaining: string;
  totalDuration: string;
  progress: number;
  photos: Photo[];
  milestones: Milestone[];
  startDate: string;
}

const TreatmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [treatmentData, setTreatmentData] = useState<TreatmentEvolution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const API_BASE_URL = 'https://bravo-backend-production.up.railway.app/api';

  const fetchTreatmentEvolution = async (showLoadingToast = false) => {
    if (!user?.token || !id) {
      setError('Token de autenticação ou ID do tratamento não encontrado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (showLoadingToast) {
        toast.loading('Atualizando dados do tratamento...');
      }

      const response = await fetch(`${API_BASE_URL}/treatments/${id}/evolution`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      setTreatmentData(data);
      setRetryCount(0);
      
      if (showLoadingToast) {
        toast.dismiss();
        toast.success('Dados atualizados com sucesso!');
      }
    } catch (err) {
      console.error('Erro ao carregar evolução do tratamento:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
      
      if (showLoadingToast) {
        toast.dismiss();
      }
      
      if (retryCount > 0) {
        toast.error('Falha ao carregar evolução do tratamento');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchTreatmentEvolution(true);
  };

  const handleRefresh = () => {
    fetchTreatmentEvolution(true);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id || !user?.token) return;

    // Validação do arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      toast.loading('Enviando foto...');

      const formData = new FormData();
      formData.append('photo', file);
      formData.append('description', `Foto de ${new Date().toLocaleDateString('pt-BR')}`);

      const response = await fetch(`${API_BASE_URL}/treatments/${id}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      // Atualizar os dados do tratamento
      await fetchTreatmentEvolution();
      
      toast.dismiss();
      toast.success('Foto enviada com sucesso!');
    } catch (err) {
      console.error('Erro ao enviar foto:', err);
      toast.dismiss();
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    if (!id || !user?.token) return;

    try {
      toast.loading('Marcando marco como concluído...');
      
      const response = await fetch(`${API_BASE_URL}/treatments/${id}/milestones/${milestoneId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      // Atualizar os dados do tratamento
      await fetchTreatmentEvolution();
      
      toast.dismiss();
      toast.success('Marco marcado como concluído!');
    } catch (err) {
      console.error('Erro ao completar marco:', err);
      toast.dismiss();
      toast.error(err instanceof Error ? err.message : 'Erro ao completar marco');
    }
  };

  useEffect(() => {
    fetchTreatmentEvolution();
  }, [id, user?.token]);

  // Auto-retry em caso de erro de conexão
  useEffect(() => {
    if (error && error.includes('conexão') && retryCount < 3) {
      const timer = setTimeout(() => {
        fetchTreatmentEvolution();
      }, 2000 * retryCount);

      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  // Restante do componente permanece igual...
  // (O código de renderização não foi alterado, apenas as chamadas de serviço)

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/cliente/tratamentos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para tratamentos
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-bravo-blue mb-2">Evolução do Tratamento</h1>
              <p className="text-gray-600">Acompanhe o progresso detalhado do seu tratamento</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-bravo-blue mb-4" />
          <p className="text-gray-600">Carregando evolução do tratamento...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Tentativa {retryCount + 1} de 4...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error || !treatmentData) {
    return (
      <div>
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/cliente/tratamentos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para tratamentos
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-bravo-blue mb-2">Evolução do Tratamento</h1>
              <p className="text-gray-600">Acompanhe o progresso detalhado do seu tratamento</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error?.includes('conexão') ? 'Problema de Conexão' : 'Erro ao carregar dados'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {error || 'Dados não encontrados'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={handleRetry}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Tentando...
                  </>
                ) : (
                  'Tentar novamente'
                )}
              </Button>
              {retryCount >= 3 && (
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.reload()}
                >
                  Recarregar página
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/cliente/tratamentos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para tratamentos
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-bravo-blue mb-2">
              {treatmentData.title || 'Evolução do Tratamento'}
            </h1>
            <p className="text-gray-600">Acompanhe o progresso detalhado do seu tratamento</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Camera className="h-5 w-5 mr-2 text-blue-600" />
              <CardTitle>Fotos da Evolução</CardTitle>
              <Badge variant="secondary" className="ml-2">
                {treatmentData.photos.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
                disabled={uploadingPhoto}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('photo-upload')?.click()}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar Foto
                  </>
                )}
              </Button>
            </div>
          </div>
          <CardDescription>
            Acompanhe visualmente o progresso do seu tratamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {treatmentData.photos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {treatmentData.photos.map((photo) => (
                <div key={photo.id} className="space-y-2">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={photo.imageUrl} 
                      alt={photo.description}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                      onClick={() => {
                        // Abrir modal ou visualização em tela cheia
                        window.open(photo.imageUrl, '_blank');
                      }}
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
          ) : (
            <div className="text-center py-8">
              <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Nenhuma foto de evolução ainda</p>
              <p className="text-sm text-gray-400 mb-4">
                Adicione fotos para acompanhar visualmente o progresso
              </p>
              <Button
                variant="outline"
                onClick={() => document.getElementById('photo-upload')?.click()}
                disabled={uploadingPhoto}
              >
                <Upload className="h-4 w-4 mr-2" />
                Adicionar primeira foto
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline de Marcos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-purple-600" />
            Marcos do Tratamento
            <Badge variant="secondary" className="ml-2">
              {treatmentData.milestones.filter(m => m.completed).length}/{treatmentData.milestones.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Principais etapas e conquistas do seu tratamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {treatmentData.milestones.length > 0 ? (
            <div className="relative">
              <div className="absolute left-4 top-6 bottom-0 w-0.5 bg-gray-200" />
              
              <div className="space-y-6">
                {treatmentData.milestones.map((milestone, index) => (
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
                    
                    <div className="ml-12 pt-1 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium">{milestone.title}</h3>
                          {milestone.completed ? (
                            <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                          ) : (
                            <Badge variant="outline">Pendente</Badge>
                          )}
                        </div>
                        {!milestone.completed && new Date(milestone.date) <= new Date() && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteMilestone(milestone.id)}
                            className="ml-4"
                          >
                            Marcar como concluído
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{milestone.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(milestone.date).toLocaleDateString('pt-BR')}
                        {new Date(milestone.date) > new Date() && (
                          <span className="ml-2 text-orange-600">(Programado)</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum marco definido ainda</p>
              <p className="text-sm text-gray-400">
                Os marcos serão definidos pelo seu médico durante o tratamento
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {treatmentData.photos.length}
              </div>
              <div className="text-sm text-gray-600">Fotos registradas</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {treatmentData.milestones.filter(m => m.completed).length}
              </div>
              <div className="text-sm text-gray-600">Marcos concluídos</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.ceil((new Date().getTime() - new Date(treatmentData.startDate).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-gray-600">Dias de tratamento</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TreatmentDetail;