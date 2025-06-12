import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

const API_BASE_URL = 'https://bravo-backend-production.up.railway.app';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MEDICO' | 'CLIENTE';
  };
}

const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('Tentando fazer login com:', { email, password: '***' });
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', response.headers);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro na resposta:', errorData);
      throw new Error(errorData.message || 'Erro ao fazer login');
    }

    const data = await response.json();
    console.log('Login bem-sucedido:', { ...data, token: '***' });
    return data;
  } catch (error) {
    console.error('Erro na requisição de login:', error);
    throw error;
  }
};

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Iniciando processo de login...');
      
      // Usa diretamente nossa função que está funcionando
      const response = await loginUser(email, password);
      console.log('API respondeu com sucesso:', response);
      
      // Se o AuthContext tem um método para definir o usuário diretamente, use-o
      // Caso contrário, vamos simular o que o contexto faria
      
      // Salva o token no localStorage (assumindo que o contexto faz isso)
      localStorage.setItem('token', response.token);
      
      // Se o contexto tem um método setUser ou similar, descomente a linha abaixo:
      // setUser(response.user);
      
      toast({
        title: 'Login realizado com sucesso',
        description: 'Seja bem-vindo à plataforma Bravo Homem.',
        duration: 3000,
      });
      
      // Redireciona com base no perfil do usuário
      console.log('Redirecionando baseado no role:', response.user.role);
      switch (response.user.role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'MEDICO':
          navigate('/medico/dashboard');
          break;
        case 'CLIENTE':
          navigate('/cliente/dashboard');
          break;
        default:
          navigate(from);
      }
      
    } catch (error) {
      console.error('Erro no login:', error);
      
      let errorMessage = 'Ocorreu um erro ao fazer login';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast({
        title: 'Erro no login',
        description: errorMessage,
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bravo-beige p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-montserrat font-bold text-bravo-blue">Bravo Homem</span>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Acesse sua conta para gerenciar seus tratamentos
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {/* Helper para credenciais de teste (apenas em desenvolvimento) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                  <p className="font-medium text-blue-800 mb-2">Credenciais para teste:</p>
                  <div className="space-y-1 text-blue-700">
                    <p><strong>Admin:</strong> admin@bravohomem.com.br / admin123</p>
                    <p><strong>Médicos:</strong> dr.silva@bravohomem.com.br / medico123</p>
                    <p><strong>Clientes:</strong> joao.cliente@gmail.com / cliente123</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Senha</Label>
                  <Link 
                    to="/esqueci-senha"
                    className="text-xs text-bravo-blue hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : 'Entrar'}
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link to="/registrar" className="text-bravo-blue hover:underline">
                  Registre-se
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <div className="text-center mt-8">
          <Link 
            to="/" 
            className="text-sm text-gray-600 hover:text-bravo-blue inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;