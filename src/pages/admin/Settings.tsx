import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { Globe, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Settings {
  general: {
    companyName: string;
    siteUrl: string;
    contactEmail: string;
    supportPhone: string;
    timezone: string;
    maintenanceMode: boolean;
  };
  security: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
}

const API_BASE_URL = 'http://localhost:3000';

const fetchSettings = async (token: string): Promise<Settings['general']> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
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
    console.error('Erro ao buscar configurações:', error);
    throw error;
  }
};

const updateSettings = async (settings: Settings['general'], token: string): Promise<Settings['general']> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    throw error;
  }
};

const changePassword = async (currentPassword: string, newPassword: string, token: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    throw error;
  }
};

const AdminSettings = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<Settings>({
    general: {
      companyName: '',
      siteUrl: '',
      contactEmail: '',
      supportPhone: '',
      timezone: 'America/Sao_Paulo',
      maintenanceMode: false,
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      if (!authUser?.token) {
        throw new Error('Token de autenticação não disponível');
      }

      const data = await fetchSettings(authUser.token);
      setSettings(prev => ({
        ...prev,
        general: data
      }));
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Falha ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [authUser?.token]);

  const handleSettingsChange = (section: keyof Settings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      if (!authUser?.token) {
        throw new Error('Token de autenticação não disponível');
      }

      const updatedSettings = await updateSettings(settings.general, authUser.token);
      setSettings(prev => ({
        ...prev,
        general: updatedSettings
      }));
      
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Falha ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (settings.security.newPassword !== settings.security.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (settings.security.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setChangingPassword(true);
      
      if (!authUser?.token) {
        throw new Error('Token de autenticação não disponível');
      }

      await changePassword(
        settings.security.currentPassword,
        settings.security.newPassword,
        authUser.token
      );

      toast.success('Senha alterada com sucesso!');
      
      setSettings(prev => ({
        ...prev,
        security: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      }));
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Falha ao alterar senha');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-bravo-blue" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-bravo-blue mb-2">Configurações</h1>
        <p className="text-gray-600">
          Configure os parâmetros gerais da plataforma
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="mb-6">
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configurações básicas da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da empresa</Label>
                  <Input
                    id="companyName"
                    value={settings.general.companyName}
                    onChange={(e) => handleSettingsChange('general', 'companyName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">URL do site</Label>
                  <Input
                    id="siteUrl"
                    value={settings.general.siteUrl}
                    onChange={(e) => handleSettingsChange('general', 'siteUrl', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">E-mail de contato</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => handleSettingsChange('general', 'contactEmail', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Telefone de suporte</Label>
                  <Input
                    id="supportPhone"
                    value={settings.general.supportPhone}
                    onChange={(e) => handleSettingsChange('general', 'supportPhone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso horário</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => handleSettingsChange('general', 'timezone', value)}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Selecione o fuso horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">América/São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/Manaus">América/Manaus (GMT-4)</SelectItem>
                      <SelectItem value="America/Belem">América/Belém (GMT-3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="maintenanceMode"
                  checked={settings.general.maintenanceMode}
                  onCheckedChange={(checked) => handleSettingsChange('general', 'maintenanceMode', checked)}
                />
                <Label htmlFor="maintenanceMode" className="font-medium">
                  Ativar modo de manutenção
                </Label>
              </div>
              
              {settings.general.maintenanceMode && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                  <strong>Atenção:</strong> O modo de manutenção bloqueia o acesso de usuários comuns ao site.
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={saveSettings}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : 'Salvar configurações'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>
                Altere a senha de administrador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={settings.security.currentPassword}
                    onChange={(e) => handleSettingsChange('security', 'currentPassword', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={settings.security.newPassword}
                    onChange={(e) => handleSettingsChange('security', 'newPassword', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={settings.security.confirmPassword}
                    onChange={(e) => handleSettingsChange('security', 'confirmPassword', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="rounded-md bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
                <strong>Dica de segurança:</strong> Use uma senha com pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleChangePassword}
                disabled={changingPassword || !settings.security.currentPassword || !settings.security.newPassword || !settings.security.confirmPassword}
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Alterando senha...
                  </>
                ) : 'Alterar senha'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;