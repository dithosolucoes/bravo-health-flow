import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Settings, Eye, Copy, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import FlowCanvas from '@/components/flow-builder/FlowCanvas';
import FlowSettings from '@/components/flow-builder/FlowSettings';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FlowItem {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  blocks: FlowBlock[];
  tags: string[];
  lastUpdated: string;
}

export interface FlowBlock {
  id: string;
  type: 'question' | 'diagnosis' | 'plan' | 'checkout';
  title: string;
  position: { x: number; y: number };
  data: any;
  next?: string | null;
}

const FlowBuilder = () => {
  const navigate = useNavigate();
  const [flows, setFlows] = useState<FlowItem[]>([]);
  const [activeFlow, setActiveFlow] = useState<FlowItem | null>(null);
  const [isCreatingFlow, setIsCreatingFlow] = useState(false);
  const [newFlow, setNewFlow] = useState({ name: '', description: '', isActive: true });
  const [currentTab, setCurrentTab] = useState('flows');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const API_BASE_URL = 'https://bravo-backend-production.up.railway.app';

  // Fetch flows on component mount
  useEffect(() => {
    const fetchFlows = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/flows`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch flows');
        }

        const data = await response.json();
        setFlows(data);
      } catch (error) {
        console.error('Error fetching flows:', error);
        toast.error('Failed to load flows');
      } finally {
        setLoading(false);
      }
    };

    fetchFlows();
  }, []);

  const handleEditFlow = (flow: FlowItem) => {
    setActiveFlow(flow);
    setCurrentTab('editor');
  };

  const handleCreateFlow = async () => {
    if (!newFlow.name.trim()) {
      toast.error('Please provide a flow name');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/flows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newFlow,
          tags: []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create flow');
      }

      const createdFlow = await response.json();
      setFlows([...flows, createdFlow]);
      setNewFlow({ name: '', description: '', isActive: true });
      setIsCreatingFlow(false);
      toast.success('Flow created successfully');
    } catch (error) {
      console.error('Error creating flow:', error);
      toast.error('Failed to create flow');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFlow = async (id: string) => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/flows/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete flow');
      }

      setFlows(flows.filter(flow => flow.id !== id));
      toast.success('Flow deleted successfully');
    } catch (error) {
      console.error('Error deleting flow:', error);
      toast.error('Failed to delete flow');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateFlow = async (flow: FlowItem) => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/flows/${flow.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate flow');
      }

      const duplicatedFlow = await response.json();
      setFlows([...flows, duplicatedFlow]);
      toast.success('Flow duplicated successfully');
    } catch (error) {
      console.error('Error duplicating flow:', error);
      toast.error('Failed to duplicate flow');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFlowStatus = async (id: string, isActive: boolean) => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/flows/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        throw new Error('Failed to update flow status');
      }

      setFlows(flows.map(flow => 
        flow.id === id ? { ...flow, isActive } : flow
      ));
      toast.success(`Flow ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating flow status:', error);
      toast.error('Failed to update flow status');
    } finally {
      setSaving(false);
    }
  };

  const handleBackToFlows = () => {
    setActiveFlow(null);
    setCurrentTab('flows');
  };

  const handleSaveFlow = async () => {
    if (!activeFlow) return;

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/flows/${activeFlow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(activeFlow)
      });

      if (!response.ok) {
        throw new Error('Failed to save flow');
      }

      const updatedFlow = await response.json();
      setFlows(flows.map(flow => 
        flow.id === updatedFlow.id ? updatedFlow : flow
      ));
      setActiveFlow(updatedFlow);
      toast.success('Flow saved successfully');
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error('Failed to save flow');
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewFlow = () => {
    if (!activeFlow) return;
    navigate(`/preview/${activeFlow.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading flows...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          {currentTab === 'flows' ? (
            <h1 className="text-2xl font-bold">Anamnesis Flow Builder</h1>
          ) : (
            <div className="flex items-center">
              <Button variant="ghost" onClick={handleBackToFlows} className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Editing: {activeFlow?.name}</h1>
            </div>
          )}
          
          {currentTab === 'editor' && activeFlow && (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handlePreviewFlow}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSaveFlow} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : 'Save Flow'}
              </Button>
            </div>
          )}
        </div>
        
        <TabsContent value="flows" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Create and manage anamnesis flows for different treatment types.
            </p>
            <Dialog open={isCreatingFlow} onOpenChange={setIsCreatingFlow}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Flow
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Flow</DialogTitle>
                  <DialogDescription>
                    Define the basic information for the anamnesis flow.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Flow Name</Label>
                    <Input
                      id="name"
                      placeholder="E.g., Hair Loss"
                      value={newFlow.name}
                      onChange={(e) => setNewFlow({...newFlow, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the purpose of this flow"
                      value={newFlow.description}
                      onChange={(e) => setNewFlow({...newFlow, description: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={newFlow.isActive}
                      onCheckedChange={(checked) => setNewFlow({...newFlow, isActive: checked})}
                    />
                    <Label htmlFor="isActive">Active Flow</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreatingFlow(false)}>Cancel</Button>
                  <Button onClick={handleCreateFlow} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : 'Create Flow'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {flows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No flows created yet</h3>
              <p className="text-gray-500 mb-4">Create your first anamnesis flow to get started</p>
              <Button onClick={() => setIsCreatingFlow(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Flow
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flows.map((flow) => (
                <Card key={flow.id} className={`hover:shadow-md transition-shadow ${flow.isActive ? 'border-green-200' : 'border-gray-200'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{flow.name}</CardTitle>
                        <CardDescription className="mt-1">{flow.description}</CardDescription>
                      </div>
                      <Badge variant={flow.isActive ? "default" : "secondary"}>
                        {flow.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Last updated: {flow.lastUpdated}</p>
                        <p className="text-sm text-gray-500">Blocks: {flow.blocks.length}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {flow.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                          {flow.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{flow.tags.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between pt-2">
                        <div className="space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDuplicateFlow(flow)}
                            disabled={saving}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Duplicate
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteFlow(flow.id)}
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                        <div className="space-x-1">
                          <Button
                            variant={flow.isActive ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleToggleFlowStatus(flow.id, !flow.isActive)}
                            disabled={saving}
                          >
                            {flow.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleEditFlow(flow)}
                            disabled={saving}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="editor" className="space-y-4">
          {activeFlow && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3">
                <Card className="h-[calc(100vh-240px)] overflow-hidden">
                  <CardHeader className="border-b bg-slate-50/80 py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        Flow: {activeFlow.name}
                        <Badge variant={activeFlow.isActive ? "default" : "secondary"} className="ml-2">
                          {activeFlow.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Add Block
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Drag and organize blocks to build your anamnesis flow.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <FlowCanvas 
                      flow={activeFlow} 
                      setFlow={(updatedFlow) => setActiveFlow(updatedFlow)}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <FlowSettings 
                  flow={activeFlow} 
                  setFlow={(updatedFlow) => setActiveFlow(updatedFlow)}
                />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FlowBuilder;