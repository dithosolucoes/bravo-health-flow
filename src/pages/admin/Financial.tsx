import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Download, ArrowUp, ArrowDown, DollarSign, TrendingUp, CreditCard, Users, Loader2, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FinancialSummary {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
}

interface Transaction {
  id: string;
  date: string;
  customer: string;
  plan: string;
  amount: number;
  status: 'succeeded' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'pix';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// API functions
const API_BASE_URL = 'http://localhost:3000';

const apiRequest = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }

    return result.data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

const fetchFinancialSummary = async (startDate?: Date, endDate?: Date) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate.toISOString());
  if (endDate) params.append('endDate', endDate.toISOString());
  
  const queryString = params.toString();
  const endpoint = `/api/financial/summary${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest<FinancialSummary[]>(endpoint);
};

const fetchRevenueData = async (startDate?: Date, endDate?: Date) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate.toISOString());
  if (endDate) params.append('endDate', endDate.toISOString());
  
  const queryString = params.toString();
  const endpoint = `/api/financial/revenue-chart${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest<{ month: string; revenue: number }[]>(endpoint);
};

const fetchUserGrowthData = async (startDate?: Date, endDate?: Date) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate.toISOString());
  if (endDate) params.append('endDate', endDate.toISOString());
  
  const queryString = params.toString();
  const endpoint = `/api/financial/user-growth${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest<{ month: string; users: number }[]>(endpoint);
};

const fetchTransactions = async (search?: string, startDate?: Date, endDate?: Date) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (startDate) params.append('startDate', startDate.toISOString());
  if (endDate) params.append('endDate', endDate.toISOString());
  
  const queryString = params.toString();
  const endpoint = `/api/financial/transactions${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest<Transaction[]>(endpoint);
};

const exportFinancialData = async (startDate?: Date, endDate?: Date) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate.toISOString());
  if (endDate) params.append('endDate', endDate.toISOString());
  
  const queryString = params.toString();
  const endpoint = `/api/financial/export${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.blob();
};

const AdminFinancial = () => {
  const [searchTransaction, setSearchTransaction] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<{ month: string; users: number }[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  // Load data from backend
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [summaryData, chartData, growthData, transactionData] = await Promise.all([
        fetchFinancialSummary(startDate, endDate),
        fetchRevenueData(startDate, endDate),
        fetchUserGrowthData(startDate, endDate),
        fetchTransactions(searchTransaction, startDate, endDate)
      ]);

      setFinancialSummary(summaryData);
      setRevenueData(chartData);
      setUserGrowthData(growthData);
      setTransactions(transactionData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados financeiros';
      setError(errorMessage);
      console.error('Error loading financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadData();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTransaction]);

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const blob = await exportFinancialData(startDate, endDate);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const dateRangeText = startDate && endDate 
        ? `_${format(startDate, "yyyy-MM-dd")}_${format(endDate, "yyyy-MM-dd")}`
        : '';
      
      link.download = `financial_report${dateRangeText}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Erro ao exportar dados financeiros');
    } finally {
      setExportLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados financeiros...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-red-600 text-center max-w-md">{error}</p>
        <Button variant="outline" onClick={handleRetry}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#58819d] mb-2">Financeiro</h1>
        <p className="text-gray-600">
          Gerenciamento financeiro e análise de receitas
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre por cliente, plano ou período de transação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Buscar por cliente, plano ou ID..."
                  value={searchTransaction}
                  onChange={(e) => setSearchTransaction(e.target.value)}
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
      
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialSummary.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className="bg-[#F5F2E8] bg-opacity-30 p-3 rounded-full">
                  {stat.title === 'Receita Total' && <DollarSign className="h-8 w-8 text-[#58819d] opacity-80" />}
                  {stat.title === 'Total de Assinantes' && <Users className="h-8 w-8 text-[#58819d] opacity-80" />}
                  {stat.title === 'Valor Médio' && <TrendingUp className="h-8 w-8 text-[#58819d] opacity-80" />}
                  {stat.title === 'Taxa de Conversão' && <CreditCard className="h-8 w-8 text-[#58819d] opacity-80" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receita Anual</CardTitle>
            <CardDescription>
              Visão geral da receita por mês
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value/1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#58819d"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Assinantes</CardTitle>
            <CardDescription>
              Total de usuários ativos por mês
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={userGrowthData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} usuários`, 'Assinantes']} />
                  <Bar dataKey="users" fill="#58819d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>
                Visualize e filtre as últimas transações
              </CardDescription>
            </div>
            <Button onClick={handleExport} disabled={exportLoading}>
              {exportLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium">Data</th>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Plano</th>
                  <th className="px-4 py-3 text-left font-medium">Método</th>
                  <th className="px-4 py-3 text-left font-medium">Valor</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">{new Date(transaction.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3">{transaction.customer}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{transaction.plan}</td>
                    <td className="px-4 py-3">
                      {transaction.paymentMethod === 'credit_card' ? 'Cartão de crédito' : 'PIX'}
                    </td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(transaction.amount)}</td>
                    <td className="px-4 py-3">
                      {transaction.status === 'succeeded' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <ArrowDown size={12} className="mr-1" />
                          Recebido
                        </span>
                      ) : transaction.status === 'failed' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Falha
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <ArrowUp size={12} className="mr-1" />
                          Estornado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma transação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFinancial;