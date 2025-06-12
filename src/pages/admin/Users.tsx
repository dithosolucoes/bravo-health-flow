import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, Phone, AlertTriangle, FileText, MoreVertical, Loader2, RefreshCw, CalendarIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: 'active' | 'blocked' | 'pending';
  type: 'new' | 'returning';
  anamneseStatus: 'completed' | 'incomplete' | 'not_started';
  treatment: 'queda-capilar' | 'disfuncao-eretil' | null;
  subscription: 'active' | 'cancelled' | 'expired' | null;
}

const API_BASE_URL = 'https://bravo-backend-production.up.railway.app';

// Funções de API
const fetchUsers = async (token: string): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
};

const updateUserStatus = async (userId: string, status: User['status'], token: string): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar status do usuário:', error);
    throw error;
  }
};

const AdminUsers = () => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [treatmentFilter, setTreatmentFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!authUser?.token) {
        throw new Error('Token de autenticação não disponível');
      }

      const data = await fetchUsers(authUser.token);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
      console.error('Error loading users:', err);
      toast.error('Falha ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [authUser?.token]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesTreatment = treatmentFilter === 'all' || user.treatment === treatmentFilter;
    
    // Date filtering
    let matchesDateRange = true;
    if (startDate || endDate) {
      const registrationDate = new Date(user.registrationDate);
      if (startDate && registrationDate < startDate) {
        matchesDateRange = false;
      }
      if (endDate && registrationDate > endDate) {
        matchesDateRange = false;
      }
    }
    
    return matchesSearch && matchesStatus && matchesTreatment && matchesDateRange;
  });
  
  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800">Bloqueado</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">Pendente</Badge>;
      default:
        return null;
    }
  };
  
  const getSubscriptionBadge = (subscription: User['subscription']) => {
    switch (subscription) {
      case 'active':
        return <Badge variant="outline" className="border-green-500 text-green-700">Assinatura ativa</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="border-red-500 text-red-700">Assinatura cancelada</Badge>;
      case 'expired':
        return <Badge variant="outline" className="border-amber-500 text-amber-700">Assinatura expirada</Badge>;
      default:
        return <Badge variant="outline">Sem assinatura</Badge>;
    }
  };
  
  const handleBlockUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      
      if (!authUser?.token) {
        throw new Error('Token de autenticação não disponível');
      }

      const updatedUser = await updateUserStatus(userId, 'blocked', authUser.token);
      setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
      
      toast.success('Usuário bloqueado com sucesso.');
    } catch (error) {
      toast.error('Erro ao bloquear usuário.');
      console.error('Error blocking user:', error);
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleUnblockUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      
      if (!authUser?.token) {
        throw new Error('Token de autenticação não disponível');
      }

      const updatedUser = await updateUserStatus(userId, 'active', authUser.token);
      setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
      
      toast.success('Usuário desbloqueado com sucesso.');
    } catch (error) {
      toast.error('Erro ao desbloquear usuário.');
      console.error('Error unblocking user:', error);
    } finally {
      setActionLoading(null);
    }
  };
  
  const viewAnamneseHistory = (userId: string) => {
    window.location.href = `/admin/users/${userId}/anamnese`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin" size={24} />
          <span>Carregando usuários...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Erro ao carregar usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadUsers} variant="outline">
              <RefreshCw size={16} className="mr-2" />
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-bravo-blue mb-2">Usuários</h1>
            <p className="text-gray-600">
              Gerencie e monitore os usuários da plataforma ({users.length} usuários)
            </p>
          </div>
          <Button onClick={loadUsers} variant="outline" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Atualizar
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre e pesquise usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Buscar por nome ou e-mail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="blocked">Bloqueados</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select
                value={treatmentFilter}
                onValueChange={setTreatmentFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tratamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tratamentos</SelectItem>
                  <SelectItem value="queda-capilar">Queda Capilar</SelectItem>
                  <SelectItem value="disfuncao-eretil">Disfunção Erétil</SelectItem>
                </SelectContent>
              </Select>
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
                    initialFocus
                    className="p-3 pointer-events-auto"
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
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map(user => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="font-medium text-lg">{user.name}</h3>
                    <span className="ml-3">{getStatusBadge(user.status)}</span>
                    {user.type === 'new' && (
                      <Badge variant="outline" className="ml-2">Novo usuário</Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="mr-1">📧</span>
                      {user.email}
                    </div>
                    <div className="flex items-center">
                      <Phone size={14} className="mr-1" />
                      {user.phone}
                    </div>
                    {user.registrationDate && (
                      <div className="text-xs">
                        Cadastrado em: {new Date(user.registrationDate).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {getSubscriptionBadge(user.subscription)}
                    
                    {user.treatment && (
                      <Badge variant="outline">
                        {user.treatment === 'queda-capilar' ? 'Queda Capilar' : 'Disfunção Erétil'}
                      </Badge>
                    )}
                    
                    {user.anamneseStatus === 'incomplete' && (
                      <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                        <AlertTriangle size={14} className="mr-1" />
                        Anamnese incompleta
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => viewAnamneseHistory(user.id)}
                    disabled={actionLoading === user.id}
                  >
                    <FileText size={16} className="mr-2" />
                    Anamnese
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={actionLoading === user.id}
                      >
                        {actionLoading === user.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <MoreVertical size={16} />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.status === 'blocked' ? (
                        <DropdownMenuItem 
                          className="text-green-600" 
                          onClick={() => handleUnblockUser(user.id)}
                        >
                          Desbloquear usuário
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          className="text-red-600" 
                          onClick={() => handleBlockUser(user.id)}
                        >
                          Bloquear usuário
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {users.length === 0 
                ? 'Nenhum usuário encontrado.' 
                : 'Nenhum usuário encontrado com os filtros selecionados.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;