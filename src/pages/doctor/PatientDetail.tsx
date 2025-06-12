import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { ArrowLeft, Upload, CheckSquare, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_URL = 'https://bravo-backend-production.up.railway.app';

const DoctorPatientDetail = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState<any>(null);
  const [observations, setObservations] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/patients/${id}`);
        if (!response.ok) {
          throw new Error('Erro ao carregar dados do paciente');
        }
        const data = await response.json();
        setPatient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar paciente');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setPrescriptionFile(file);
      } else {
        toast.error('Por favor, selecione apenas arquivos PDF.');
      }
    }
  };
  
  const handleSubmit = async () => {
    if (!prescriptionFile) {
      toast.error('Por favor, faça upload da prescrição em PDF.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('prescription', prescriptionFile);
      formData.append('observations', observations);
      formData.append('patientId', id || '');

      const response = await fetch(`${API_URL}/evaluations`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar avaliação');
      }

      toast.success('Avaliação concluída com sucesso!');
      
      // Redirect back to dashboard
      setTimeout(() => {
        navigate('/medico/dashboard');
      }, 1500);
    } catch (error) {
      toast.error('Erro ao salvar avaliação. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando dados do paciente...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!patient) {
    return <div>Paciente não encontrado</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="mr-1" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-bravo-blue">
            Avaliação do Paciente
          </h1>
          <p className="text-gray-600">
            Revise as informações e forneça uma prescrição
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Paciente</CardTitle>
              <CardDescription>
                Dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nome</h3>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Idade</h3>
                <p className="font-medium">{patient.age} anos</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Data de nascimento</h3>
                <p className="font-medium">{new Date(patient.personalInfo.birthdate).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">E-mail</h3>
                <p className="font-medium">{patient.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Telefone</h3>
                <p className="font-medium">{patient.phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Altura</h3>
                <p className="font-medium">{patient.personalInfo.height} cm</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Peso</h3>
                <p className="font-medium">{patient.personalInfo.weight} kg</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Data da anamnese</h3>
                <p className="font-medium">{new Date(patient.date).toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tipo de tratamento</h3>
                <p className="font-medium">
                  {patient.type === 'queda-capilar' ? 'Queda Capilar' : 'Disfunção Erétil'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          {/* Anamnesis Answers */}
          <Card>
            <CardHeader>
              <CardTitle>Respostas da Anamnese</CardTitle>
              <CardDescription>
                Respostas fornecidas pelo paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.answers.map((item: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-1">{item.question}</h3>
                    <p className="text-gray-900">{item.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Medical Evaluation */}
          <Card>
            <CardHeader>
              <CardTitle>Avaliação Médica</CardTitle>
              <CardDescription>
                Forneça suas observações e faça upload da prescrição
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações médicas (opcional)
                </label>
                <Textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Digite suas observações sobre o caso..."
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload da Prescrição (PDF) *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                    <div className="mb-2">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="prescription-upload"
                      />
                      <label htmlFor="prescription-upload" className="cursor-pointer">
                        <Button variant="outline" asChild>
                          <span>Selecionar arquivo PDF</span>
                        </Button>
                      </label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Faça upload da prescrição em formato PDF
                    </p>
                  </div>
                  {prescriptionFile && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <FileText size={20} className="text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">
                          {prescriptionFile.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-100 pt-4 flex justify-end">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !prescriptionFile}
              >
                <CheckSquare size={16} className="mr-2" />
                {isSubmitting ? 'Salvando...' : 'Finalizar avaliação'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientDetail;