
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Calendar, Search, FileText, Download, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DoctorPrescriptions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  

  const allPrescriptions = [
    {
      id: '1',
      patientName: 'João Silva',
      patientAge: 32,
      evaluationDate: '2023-03-25',
      type: 'queda-capilar',
      observations: 'Paciente apresenta alopecia androgenética grau 3. Indicado tratamento com finasterida e minoxidil.',
      prescriptionFile: 'prescricao_joao_silva_25032023.pdf'
    },
    {
      id: '2',
      patientName: 'Marcos Oliveira',
      patientAge: 45,
      evaluationDate: '2023-03-25',
      type: 'disfuncao-eretil',
      observations: 'Paciente relata dificuldades de ereção há 6 meses. Indicado tadalafila 5mg.',
      prescriptionFile: 'prescricao_marcos_oliveira_25032023.pdf'
    },
    {
      id: '3',
      patientName: 'André Costa',
      patientAge: 28,
      evaluationDate: '2023-03-24',
      type: 'queda-capilar',
      observations: 'Início de calvície masculina. Tratamento preventivo com finasterida.',
      prescriptionFile: 'prescricao_andre_costa_24032023.pdf'
    },
    {
      id: '4',
      patientName: 'Carlos Eduardo',
      patientAge: 41,
      evaluationDate: '2023-03-23',
      type: 'disfuncao-eretil',
      observations: 'DE moderada. Prescrito sildenafila 50mg conforme necessário.',
      prescriptionFile: 'prescricao_carlos_eduardo_23032023.pdf'
    },
    {
      id: '5',
      patientName: 'Paulo Vieira',
      patientAge: 35,
      evaluationDate: '2023-03-23',
      type: 'queda-capilar',
      observations: 'Calvície avançada. Combinação de finasterida 1mg e minoxidil 5%.',
      prescriptionFile: 'prescricao_paulo_vieira_23032023.pdf'
    },
  ];
  
  // Filter prescriptions based on search query and filters
  const filteredPrescriptions = allPrescriptions.filter(prescription => {
    // Search filter
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter
    const matchesType = typeFilter === 'all' || prescription.type === typeFilter;
    
    // Date filter
    let matchesDate = true;
    const evaluationDate = new Date(prescription.evaluationDate);
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    if (dateFilter === 'today') {
      matchesDate = evaluationDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'week') {
      matchesDate = evaluationDate >= lastWeek;
    } else if (dateFilter === 'month') {
      matchesDate = evaluationDate >= lastMonth;
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  const handleDownload = (filename: string) => {
    // Simulate PDF download
    console.log('Downloading:', filename);
  };

  const handleView = (filename: string) => {
    // Simulate PDF view
    console.log('Viewing:', filename);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#58819d] mb-2">
          Minhas Prescrições
        </h1>
        <p className="text-gray-600">
          Gerencie todas as prescrições realizadas
        </p>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre por nome do paciente, tipo de tratamento ou data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Buscar por nome do paciente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo de tratamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="queda-capilar">Queda Capilar</SelectItem>
                  <SelectItem value="disfuncao-eretil">Disfunção Erétil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select
                value={dateFilter}
                onValueChange={setDateFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrar por data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as datas</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Results */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Prescrições</CardTitle>
            <span className="text-sm text-gray-500">
              {filteredPrescriptions.length} {filteredPrescriptions.length === 1 ? 'prescrição' : 'prescrições'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPrescriptions.length > 0 ? (
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrescriptions.map(prescription => (
                      <TableRow key={prescription.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <User size={16} className="mr-2 text-gray-400" />
                            <div>
                              <div className="font-medium">{prescription.patientName}</div>
                              <div className="text-sm text-gray-500">{prescription.patientAge} anos</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {prescription.type === 'queda-capilar' ? 'Queda Capilar' : 'Disfunção Erétil'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar size={14} className="mr-1 text-gray-400" />
                            {new Date(prescription.evaluationDate).toLocaleDateString('pt-BR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-600 truncate" title={prescription.observations}>
                              {prescription.observations}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(prescription.prescriptionFile)}
                            >
                              <Eye size={14} className="mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(prescription.prescriptionFile)}
                            >
                              <Download size={14} className="mr-1" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {filteredPrescriptions.map(prescription => (
                  <Card key={prescription.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <User size={16} className="mr-2 text-gray-400" />
                            <div>
                              <div className="font-medium">{prescription.patientName}</div>
                              <div className="text-sm text-gray-500">{prescription.patientAge} anos</div>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {prescription.type === 'queda-capilar' ? 'Queda Capilar' : 'Disfunção Erétil'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar size={14} className="mr-1 text-gray-400" />
                          {new Date(prescription.evaluationDate).toLocaleDateString('pt-BR')}
                        </div>
                        
                        <p className="text-sm text-gray-600">{prescription.observations}</p>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(prescription.prescriptionFile)}
                            className="flex-1"
                          >
                            <Eye size={14} className="mr-1" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(prescription.prescriptionFile)}
                            className="flex-1"
                          >
                            <Download size={14} className="mr-1" />
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
                Nenhuma prescrição encontrada com os filtros selecionados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorPrescriptions;
