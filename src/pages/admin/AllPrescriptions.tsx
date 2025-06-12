import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { User, CalendarIcon, Search, FileText, Download, Eye, UserCheck, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

interface Prescription {
  id: string;
  patientName: string;
  patientAge: number;
  doctorName: string;
  doctorCRM: string;
  type: 'queda-capilar' | 'disfuncao-eretil';
  uploadDate: string;
  observations: string;
  prescriptionFile: string;
  prescriptionUrl?: string;
}

const API_BASE_URL = 'https://bravo-backend-production.up.railway.app';

const AllPrescriptions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrescriptions, setSelectedPrescriptions] = useState<string[]>([]);
  const [downloadingMass, setDownloadingMass] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<string | null>(null);

  // Fetch prescriptions from API
  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      
      if (searchQuery.trim()) {
        queryParams.append('search', searchQuery.trim());
      }
      
      if (startDate) {
        queryParams.append('startDate', startDate.toISOString().split('T')[0]);
      }
      
      if (endDate) {
        queryParams.append('endDate', endDate.toISOString().split('T')[0]);
      }

      const url = `${API_BASE_URL}/api/prescriptions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Adicione aqui o token de autenticação se necessário
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar prescrições');
      }

      const data = await response.json();
      setPrescriptions(data.prescriptions || data);
      
    } catch (err) {
      console.error('Erro ao buscar prescrições:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar prescrições');
    } finally {
      setLoading(false);
    }
  };

  // Load prescriptions on component mount and when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPrescriptions();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, startDate, endDate]);

  // Handle individual prescription selection
  const handleSelectPrescription = (prescriptionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPrescriptions(prev => [...prev, prescriptionId]);
    } else {
      setSelectedPrescriptions(prev => prev.filter(id => id !== prescriptionId));
    }
  };

  // Handle select all toggle
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPrescriptions(prescriptions.map(p => p.id));
    } else {
      setSelectedPrescriptions([]);
    }
  };

  // Handle mass download
  const handleMassDownload = async () => {
    if (selectedPrescriptions.length === 0) {
      toast.error('Selecione pelo menos uma prescrição para download');
      return;
    }

    try {
      setDownloadingMass(true);
      
      const response = await fetch(`${API_BASE_URL}/api/prescriptions/mass-download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prescriptionIds: selectedPrescriptions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro no download em massa');
      }

      // Se o backend retorna um arquivo ZIP
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescricoes_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Download iniciado para ${selectedPrescriptions.length} prescrições`);
      setSelectedPrescriptions([]);
      
    } catch (err) {
      console.error('Erro no download em massa:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao fazer download em massa');
    } finally {
      setDownloadingMass(false);
    }
  };

  // Download prescription file
  const handleDownload = async (prescriptionId: string, filename: string) => {
    try {
      setDownloadingFile(prescriptionId);
      
      const response = await fetch(`${API_BASE_URL}/api/prescriptions/${prescriptionId}/download`, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao baixar arquivo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Download iniciado com sucesso');
      
    } catch (err) {
      console.error('Erro ao baixar arquivo:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao baixar arquivo');
    } finally {
      setDownloadingFile(null);
    }
  };

  // View prescription file
  const handleView = async (prescriptionId: string) => {
    try {
      setViewingFile(prescriptionId);
      
      const response = await fetch(`${API_BASE_URL}/api/prescriptions/${prescriptionId}/view`, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao visualizar arquivo');
      }

      const data = await response.json();
      
      // Se o backend retorna uma URL para visualização
      if (data.viewUrl) {
        window.open(data.viewUrl, '_blank');
      } else {
        // Ou se retorna o arquivo diretamente
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
      }
      
    } catch (err) {
      console.error('Erro ao visualizar arquivo:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao visualizar arquivo');
    } finally {
      setViewingFile(null);
    }
  };

  // Retry loading
  const handleRetry = () => {
    fetchPrescriptions();
  };
  
  // Filter prescriptions based on search query and date range (client-side backup)
  const filteredPrescriptions = prescriptions.filter(prescription => {
    // Se a API já fez a filtragem, podemos pular essa etapa
    // Mas mantemos como fallback caso a API não suporte filtros
    const matchesSearch = 
      prescription.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.doctorName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDateRange = true;
    if (prescription.uploadDate && (startDate || endDate)) {
      const uploadDate = new Date(prescription.uploadDate);
      
      if (startDate && endDate) {
        matchesDateRange = uploadDate >= startDate && uploadDate <= endDate;
      } else if (startDate) {
        matchesDateRange = uploadDate >= startDate;
      } else if (endDate) {
        matchesDateRange = uploadDate <= endDate;
      }
    }
    
    return matchesSearch && matchesDateRange;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#58819d] mb-2">
            Todas as Prescrições
          </h1>
          <p className="text-gray-600">
            Visualize e gerencie todas as prescrições dos médicos
          </p>
        </div>
        
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#58819d] mb-4" />
              <p className="text-gray-600">Carregando prescrições...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#58819d] mb-2">
            Todas as Prescrições
          </h1>
          <p className="text-gray-600">
            Visualize e gerencie todas as prescrições dos médicos
          </p>
        </div>
        
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <span>Erro ao carregar prescrições: {error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Tentar novamente
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#58819d] mb-2">
            Todas as Prescrições
          </h1>
          <p className="text-gray-600">
            Visualize e gerencie todas as prescrições dos médicos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedPrescriptions.length > 0 && (
            <Button 
              onClick={handleMassDownload}
              disabled={downloadingMass}
              className="bg-[#58819d] hover:bg-[#4a6d84]"
            >
              {downloadingMass ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              Download ({selectedPrescriptions.length})
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={handleRetry}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre por paciente, médico ou período de upload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Buscar por paciente ou médico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Data início"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    className="pointer-events-auto"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "Data fim"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    className="pointer-events-auto"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {(startDate || endDate) && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {startDate && endDate ? (
                  `Período: ${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`
                ) : startDate ? (
                  `A partir de: ${format(startDate, "dd/MM/yyyy")}`
                ) : (
                  `Até: ${format(endDate!, "dd/MM/yyyy")}`
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
              >
                Limpar datas
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Results */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Prescrições</CardTitle>
            <div className="flex items-center gap-4">
              {filteredPrescriptions.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedPrescriptions.length === filteredPrescriptions.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium">
                    Selecionar todos
                  </label>
                </div>
              )}
              <span className="text-sm text-gray-500">
                {filteredPrescriptions.length} {filteredPrescriptions.length === 1 ? 'prescrição' : 'prescrições'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPrescriptions.length > 0 ? (
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden xl:block">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 w-10">
                          <Checkbox
                            checked={selectedPrescriptions.length === filteredPrescriptions.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Paciente</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Médico</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Data Upload</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Observações</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPrescriptions.map(prescription => (
                        <tr key={prescription.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <Checkbox
                              checked={selectedPrescriptions.includes(prescription.id)}
                              onCheckedChange={(checked) => handleSelectPrescription(prescription.id, !!checked)}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <User size={16} className="mr-2 text-gray-400" />
                              <div>
                                <div className="font-medium">{prescription.patientName}</div>
                                <div className="text-sm text-gray-500">{prescription.patientAge} anos</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <UserCheck size={16} className="mr-2 text-gray-400" />
                              <div>
                                <div className="font-medium">{prescription.doctorName}</div>
                                <div className="text-sm text-gray-500">{prescription.doctorCRM}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">
                              {prescription.type === 'queda-capilar' ? 'Queda Capilar' : 'Disfunção Erétil'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center text-sm">
                              <CalendarIcon size={14} className="mr-1 text-gray-400" />
                              {prescription.uploadDate ? new Date(prescription.uploadDate).toLocaleDateString('pt-BR') : 'N/A'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="max-w-xs">
                              <p className="text-sm text-gray-600 truncate" title={prescription.observations}>
                                {prescription.observations || 'Sem observações'}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(prescription.id)}
                                disabled={viewingFile === prescription.id}
                              >
                                {viewingFile === prescription.id ? (
                                  <Loader2 size={14} className="mr-1 animate-spin" />
                                ) : (
                                  <Eye size={14} className="mr-1" />
                                )}
                                Ver
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(prescription.id, prescription.prescriptionFile)}
                                disabled={downloadingFile === prescription.id}
                              >
                                {downloadingFile === prescription.id ? (
                                  <Loader2 size={14} className="mr-1 animate-spin" />
                                ) : (
                                  <Download size={14} className="mr-1" />
                                )}
                                Download
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile/Tablet Cards */}
              <div className="xl:hidden space-y-4">
                {filteredPrescriptions.map(prescription => (
                  <Card key={prescription.id} className={selectedPrescriptions.includes(prescription.id) ? 'ring-2 ring-[#58819d]' : ''}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedPrescriptions.includes(prescription.id)}
                              onCheckedChange={(checked) => handleSelectPrescription(prescription.id, !!checked)}
                            />
                            <div className="flex items-center">
                              <User size={16} className="mr-2 text-gray-400" />
                              <div>
                                <div className="font-medium">{prescription.patientName}</div>
                                <div className="text-sm text-gray-500">{prescription.patientAge} anos</div>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {prescription.type === 'queda-capilar' ? 'Queda Capilar' : 'Disfunção Erétil'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center">
                          <UserCheck size={16} className="mr-2 text-gray-400" />
                          <div>
                            <div className="font-medium text-sm">{prescription.doctorName}</div>
                            <div className="text-xs text-gray-500">{prescription.doctorCRM}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon size={14} className="mr-1 text-gray-400" />
                          Upload: {prescription.uploadDate ? new Date(prescription.uploadDate).toLocaleDateString('pt-BR') : 'N/A'}
                        </div>
                        
                        <p className="text-sm text-gray-600">{prescription.observations || 'Sem observações'}</p>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(prescription.id)}
                            className="flex-1"
                            disabled={viewingFile === prescription.id}
                          >
                            {viewingFile === prescription.id ? (
                              <Loader2 size={14} className="mr-1 animate-spin" />
                            ) : (
                              <Eye size={14} className="mr-1" />
                            )}
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(prescription.id, prescription.prescriptionFile)}
                            className="flex-1"
                            disabled={downloadingFile === prescription.id}
                          >
                            {downloadingFile === prescription.id ? (
                              <Loader2 size={14} className="mr-1 animate-spin" />
                            ) : (
                              <Download size={14} className="mr-1" />
                            )}
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">Nenhuma prescrição encontrada</p>
              <p className="text-sm text-gray-400">
                {prescriptions.length === 0 
                  ? 'Nenhuma prescrição cadastrada no sistema.'
                  : 'Nenhuma prescrição encontrada com os filtros selecionados.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllPrescriptions;