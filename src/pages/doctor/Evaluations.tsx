import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Download } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const API_BASE_URL = 'https://bravo-backend-production.up.railway.app';

type MedicationStatus = 'habito' | 'inabito' | 'atencao';

interface Patient {
  id: string;
  name: string;
  age: number;
  date: string; // ISO 8601
  type: 'queda-capilar' | 'disfuncao-eretil';
  medicationStatus: MedicationStatus;
}

const DoctorEvaluations = () => {
  const [pendingEvaluations, setPendingEvaluations] = useState<Patient[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // 1. Fetchar avaliações pendentes ao montar o componente
  useEffect(() => {
    const fetchPendingEvaluations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Usuário não autenticado');
        }

        const response = await fetch(
          `${API_BASE_URL}/api/doctor/evaluations/pending`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Erro ao buscar avaliações: ${response.status}`
          );
        }

        const data: Patient[] = await response.json();
        setPendingEvaluations(data);
      } catch (err) {
        console.error('Erro ao buscar avaliações pendentes:', err);
        toast.error(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar pacientes pendentes.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingEvaluations();
  }, []);

  // 2. Função para renderizar o Badge de status de medicação
  const getMedicationStatusBadge = (status: MedicationStatus) => {
    switch (status) {
      case 'habito':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Hábito
          </Badge>
        );
      case 'inabito':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Inábito
          </Badge>
        );
      case 'atencao':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            Atenção
          </Badge>
        );
      default:
        return null;
    }
  };

  // 3. Selecionar/desmarcar um paciente
  const handlePatientSelection = (patientId: string, checked: boolean) => {
    if (checked) {
      setSelectedPatients((prev) => [...prev, patientId]);
    } else {
      setSelectedPatients((prev) => prev.filter((id) => id !== patientId));
    }
  };

  // 4. Selecionar/desmarcar todos os pacientes visíveis
  const handleSelectAll = (
    patients: Patient[],
    checked: boolean
  ) => {
    if (checked) {
      const patientIds = patients.map((p) => p.id);
      setSelectedPatients((prev) => [...new Set([...prev, ...patientIds])]);
    } else {
      const patientIds = patients.map((p) => p.id);
      setSelectedPatients((prev) =>
        prev.filter((id) => !patientIds.includes(id))
      );
    }
  };

  // 5. Fazer download de um arquivo Excel com os pacientes selecionados
  const downloadExcel = async () => {
    if (selectedPatients.length === 0) return;

    setIsDownloading(true);
    try {
      // Filtrar apenas os pacientes atualmente pendentes que foram selecionados
      const selectedPatientsData = pendingEvaluations.filter((p) =>
        selectedPatients.includes(p.id)
      );

      // Criar conteúdo tab-separated para Excel
      const excelContent = [
        ['Nome', 'Idade', 'Data', 'Tipo', 'Status Medicação'].join('\t'),
        ...selectedPatientsData.map((patient) =>
          [
            patient.name,
            patient.age.toString(),
            new Date(patient.date).toLocaleString('pt-BR'),
            patient.type === 'queda-capilar'
              ? 'Queda Capilar'
              : 'Disfunção Erétil',
            patient.medicationStatus === 'habito'
              ? 'Hábito'
              : patient.medicationStatus === 'inabito'
              ? 'Inábito'
              : 'Atenção',
          ].join('\t')
        ),
      ].join('\n');

      // Criar BLOB e forçar download
      const blob = new Blob([excelContent], {
        type: 'application/vnd.ms-excel;charset=utf-8;',
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `pacientes_selecionados_${new Date()
          .toISOString()
          .split('T')[0]}.xls`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Excel gerado para ${selectedPatientsData.length} paciente(s)!`);
    } catch (err) {
      console.error('Erro ao gerar Excel:', err);
      toast.error('Erro ao gerar arquivo Excel.');
    } finally {
      setIsDownloading(false);
    }
  };

  // 6. Renderiza a lista de pacientes para uma determinada aba
  const renderPatientList = (
    patients: Patient[],
    showTypeFilter = false
  ) => (
    <div className="space-y-4">
      {patients.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              aria-label="Selecionar todos"
              checked={patients.every((p) =>
                selectedPatients.includes(p.id)
              )}
              onCheckedChange={(checked) =>
                handleSelectAll(patients, checked as boolean)
              }
            />
            <span className="text-sm font-medium">Selecionar todos</span>
          </div>
          {selectedPatients.length > 0 && (
            <Button
              onClick={downloadExcel}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
              disabled={isDownloading}
            >
              <Download size={16} />
              <span>
                {isDownloading
                  ? 'Gerando...'
                  : `Baixar Excel (${selectedPatients.length})`}
              </span>
            </Button>
          )}
        </div>
      )}

      {patients.map((patient) => (
        <div
          key={patient.id}
          className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-gray-200 transition-all"
        >
          <div className="flex items-center space-x-3">
            <Checkbox
              aria-label={`Selecionar paciente ${patient.name}`}
              checked={selectedPatients.includes(patient.id)}
              onCheckedChange={(checked) =>
                handlePatientSelection(patient.id, checked as boolean)
              }
            />
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="font-medium">{patient.name}</h3>
                <span className="text-sm text-gray-500 ml-2">
                  {patient.age} anos
                </span>
                {getMedicationStatusBadge(patient.medicationStatus)}
                {showTypeFilter && (
                  <Badge className="ml-2" variant="outline">
                    {patient.type === 'queda-capilar'
                      ? 'Queda Capilar'
                      : 'Disfunção Erétil'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Clock size={14} className="mr-1" />
                <span>
                  Enviado em {new Date(patient.date).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
          <Button asChild>
            <Link to={`/medico/paciente/${patient.id}`}>Avaliar</Link>
          </Button>
        </div>
      ))}

      {patients.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-gray-500">
            Nenhum paciente encontrado nesta categoria.
          </p>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <p className="text-center text-gray-500">Carregando pacientes...</p>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-bravo-blue">
            Fila de Avaliação
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie e avalie os pacientes aguardando consulta
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pacientes Aguardando Avaliação</CardTitle>
          <CardDescription>
            {pendingEvaluations.length} pacientes na fila de avaliação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                Todos ({pendingEvaluations.length})
              </TabsTrigger>
              <TabsTrigger value="hair">
                Queda Capilar (
                {pendingEvaluations.filter(
                  (p) => p.type === 'queda-capilar'
                ).length}
                )
              </TabsTrigger>
              <TabsTrigger value="ed">
                Disfunção Erétil (
                {pendingEvaluations.filter(
                  (p) => p.type === 'disfuncao-eretil'
                ).length}
                )
              </TabsTrigger>
              <TabsTrigger value="habitos">
                Hábitos (
                {pendingEvaluations.filter(
                  (p) => p.medicationStatus === 'habito'
                ).length}
                )
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {renderPatientList(pendingEvaluations, true)}
            </TabsContent>

            <TabsContent value="hair">
              {renderPatientList(
                pendingEvaluations.filter((p) => p.type === 'queda-capilar')
              )}
            </TabsContent>

            <TabsContent value="ed">
              {renderPatientList(
                pendingEvaluations.filter((p) => p.type === 'disfuncao-eretil')
              )}
            </TabsContent>

            <TabsContent value="habitos">
              {renderPatientList(
                pendingEvaluations.filter((p) => p.medicationStatus === 'habito')
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorEvaluations;
