import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    // Verificar se o token existe na URL
    if (!token) {
      setError('Token de redefinição inválido ou expirado.');
      setIsValidToken(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Fazer requisição para a API
      const response = await fetch('https://bravo-backend-production.up.railway.app/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao redefinir senha');
      }

      toast({
        title: 'Senha redefinida com sucesso',
        description: 'Sua senha foi alterada. Faça login com sua nova senha.',
        duration: 5000,
      });
      
      // Redirecionar para a página de login
      navigate('/login');
      
    } catch (error) {
      console.error('Reset password error:', error);
      
      // Tratamento de erro mais específico
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Não foi possível redefinir a senha. Tente novamente ou solicite um novo link.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
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
              <CardTitle>Link Inválido</CardTitle>
              <CardDescription>
                Este link de redefinição é inválido ou expirou
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Link to="/esqueci-senha" className="w-full">
                <Button className="w-full">
                  Solicitar novo link
                </Button>
              </Link>
              <div className="text-center text-sm text-gray-600">
                <Link to="/login" className="text-bravo-blue hover:underline">
                  Voltar ao login
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

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
            <CardTitle>Redefinir Senha</CardTitle>
            <CardDescription>
              Digite sua nova senha
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500">
                  Mínimo de 6 caracteres
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                <Link to="/login" className="text-bravo-blue hover:underline">
                  Voltar ao login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <div className="text-center mt-8">
          <Link to="/" className="text-sm text-gray-600 hover:text-bravo-blue">
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;