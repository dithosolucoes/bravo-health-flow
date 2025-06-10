import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

const API_BASE_URL ='http://localhost:3000';

interface DoctorProfileData {
  name: string;
  email: string;
  crm: string;
  specialty: string;
  phone: string;
}

const DoctorProfile = () => {
  const { user, updateUser } = useAuth();

  const [profileInfo, setProfileInfo] = useState<DoctorProfileData>({
    name: '',
    email: '',
    crm: '',
    specialty: '',
    phone: '',
  });

  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // GET /api/doctors/profile
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Usuário não autenticado');

        const response = await fetch(`${API_BASE_URL}/api/doctors/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Erro ao buscar perfil: ${response.status}`);
        }

        const data = await response.json();

        setProfileInfo({
          name: data.name,
          email: data.email,
          crm: data.crm || '',
          specialty: data.specialty || '',
          phone: data.phone || '',
        });

        updateUser({
          ...user,
          name: data.name,
          email: data.email,
          doctorProfile: {
            crm: data.crm,
            specialty: data.specialty,
            phone: data.phone,
          },
        });

      } catch (err) {
        console.error('Erro ao buscar perfil:', err);
        toast.error(err instanceof Error ? err.message : 'Erro ao buscar perfil');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchDoctorProfile();
  }, []);

  const handleProfileInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileInfo({
      ...profileInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordInfo({
      ...passwordInfo,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfileInfo = async () => {
    try {
      setIsUpdatingProfile(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Usuário não autenticado');

      const response = await fetch(`${API_BASE_URL}/api/doctors/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileInfo),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao atualizar perfil: ${response.status}`);
      }

      const updatedData = await response.json();

      updateUser({
        ...user,
        name: updatedData.name,
        doctorProfile: {
          crm: updatedData.crm,
          specialty: updatedData.specialty,
          phone: updatedData.phone,
        },
      });

      toast.success('Informações profissionais salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const changePassword = async () => {
    try {
      if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
        toast.error('As senhas não conferem.');
        return;
      }

      if (passwordInfo.newPassword.length < 6) {
        toast.error('A nova senha deve ter pelo menos 6 caracteres.');
        return;
      }

      setIsChangingPassword(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Usuário não autenticado');

      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordInfo.currentPassword,
          newPassword: passwordInfo.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao alterar senha: ${response.status}`);
      }

      toast.success('Senha alterada com sucesso!');
      setPasswordInfo({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loadingProfile) {
    return <p className="text-center text-gray-500">Carregando dados do perfil...</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-bravo-blue mb-2">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações profissionais</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Informações Profissionais</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações Profissionais</CardTitle>
              <CardDescription>Atualize seus dados pessoais e profissionais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" name="name" value={profileInfo.name} onChange={handleProfileInfoChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" value={profileInfo.email} onChange={handleProfileInfoChange} disabled />
                  <p className="text-xs text-gray-500">O e-mail não pode ser alterado.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crm">CRM</Label>
                  <Input id="crm" name="crm" value={profileInfo.crm} onChange={handleProfileInfoChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input id="specialty" name="specialty" value={profileInfo.specialty} onChange={handleProfileInfoChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" name="phone" value={profileInfo.phone} onChange={handleProfileInfoChange} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button onClick={saveProfileInfo} disabled={isUpdatingProfile}>
                {isUpdatingProfile ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Altere sua senha de acesso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha atual</Label>
                <Input id="currentPassword" name="currentPassword" type="password" value={passwordInfo.currentPassword} onChange={handlePasswordInfoChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <Input id="newPassword" name="newPassword" type="password" value={passwordInfo.newPassword} onChange={handlePasswordInfoChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirme a nova senha</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" value={passwordInfo.confirmPassword} onChange={handlePasswordInfoChange} />
                </div>
              </div>

              <p className="text-sm text-gray-500">A senha deve ter pelo menos 6 caracteres.</p>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button onClick={changePassword} disabled={isChangingPassword}>
                {isChangingPassword ? 'Alterando...' : 'Alterar senha'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorProfile;
