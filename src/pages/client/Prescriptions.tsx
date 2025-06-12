import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, User, Loader2, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface Prescription {
  id: string;
  type: 'prescription';
  title: string;
  date: string;
  status: 'completed' | 'active';
  details: {
    doctor?: string;
    medications?: string[];
    duration?: string;
    notes?: string;
  };
}

const API_BASE_URL = 'https://bravo-backend-production.up.railway.app';

const fetchPrescriptions = async (token: string): Promise<Prescription[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/client/prescriptions`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar prescrições:', error);
    throw error;
  }
};

const ClientPrescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.token) {
        throw new Error('Token de autenticação não disponível');
      }

      const data = await fetchPrescriptions(user.token);
      setPrescriptions(data);
    } catch (err) {
      console.error('Erro ao carregar prescrições:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast.error('Falha ao carregar prescrições');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.token]);

  const getBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Ativo</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Concluído</Badge>;
      default:
        return <Badge variant="outline">Outro</Badge>;
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-bravo-blue mb-2">Minhas Prescrições</h1>
          <p className="text-gray-600">Acompanhe suas prescrições médicas e medicamentos</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-bravo-blue mb-4" />
          <p className="text-gray-600">Carregando suas prescrições...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-bravo-blue mb-2">Minhas Prescrições</h1>
          <p className="text-gray-600">Acompanhe suas prescrições médicas e medicamentos</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar prescrições</h3>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <Button 
              variant="outline" 
              onClick={fetchData}
              className="mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-bravo-blue mb-2">Minhas Prescrições</h1>
          <p className="text-gray-600">Acompanhe suas prescrições médicas e medicamentos</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <Calendar className="h-8 w-8 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma prescrição encontrada</h3>
            <p className="text-sm text-gray-500">
              Suas prescrições aparecerão aqui quando disponíveis
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-bravo-blue mb-2">Minhas Prescrições</h1>
        <p className="text-gray-600">Acompanhe suas prescrições médicas e medicamentos</p>
      </div>
      
      <div className="space-y-6">
        {prescriptions.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                    {item.title}
                    <span className="ml-3">
                      {getBadge(item.status)}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {new Date(item.date).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <User size={16} className="mr-2 text-gray-500 mt-0.5" />
                  <span className="text-sm text-gray-700">{item.details.doctor}</span>
                </div>
                
                <div className="text-sm text-gray-700">
                  <span className="font-medium block mb-2">Medicamentos:</span>
                  <ul className="list-disc pl-5 space-y-1">
                    {item.details.medications?.map((med, index) => (
                      <li key={index}>{med}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Duração:</span> {item.details.duration}
                </div>
                
                {item.details.notes && (
                  <div className="text-sm text-gray-700">
                    <span className="font-medium block mb-1">Observações:</span>
                    <p className="text-gray-600">{item.details.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClientPrescriptions;