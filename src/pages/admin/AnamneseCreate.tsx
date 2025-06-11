import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type QuestionType = 'text' | 'number' | 'boolean' | 'single-choice' | 'multiple-choice';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
}

const API_BASE_URL = 'http://localhost:3000';

const AdminAnamneseCreate = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('text');
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const addQuestion = () => {
    if (!questionText.trim()) {
      toast.error('Por favor, insira o texto da pergunta.');
      return;
    }

    if (questionType === 'single-choice' || questionType === 'multiple-choice') {
      if (options.length < 2) {
        toast.error('Por favor, adicione pelo menos duas opções para a pergunta de múltipla escolha.');
        return;
      }
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      text: questionText,
      type: questionType,
      options: questionType === 'single-choice' || questionType === 'multiple-choice' ? options : undefined,
    };

    setQuestions([...questions, newQuestion]);
    setQuestionText('');
    setOptions([]);
    setNewOption('');
    setQuestionType('text');
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((question) => question.id !== id));
  };

  const addOption = () => {
    if (!newOption.trim()) {
      toast.error('Por favor, insira o texto da opção.');
      return;
    }

    if (options.includes(newOption.trim())) {
      toast.error('Esta opção já foi adicionada.');
      return;
    }

    setOptions([...options, newOption.trim()]);
    setNewOption('');
  };

  const removeOption = (option: string) => {
    setOptions(options.filter((opt) => opt !== option));
  };

  const createAnamnese = async (anamneseData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/anamnese`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Adicione aqui o token de autenticação se necessário
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(anamneseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar anamnese');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Por favor, insira o título da anamnese.');
      return;
    }

    if (!description.trim()) {
      toast.error('Por favor, insira a descrição da anamnese.');
      return;
    }

    if (questions.length === 0) {
      toast.error('Por favor, adicione pelo menos uma pergunta à anamnese.');
      return;
    }

    setIsLoading(true);

    try {
      const anamneseData = {
        title: title.trim(),
        description: description.trim(),
        questions: questions.map(q => ({
          text: q.text,
          type: q.type,
          options: q.options || null,
        })),
        active: true,
        createdAt: new Date().toISOString(),
      };

      console.log('Enviando dados:', anamneseData);

      const result = await createAnamnese(anamneseData);
      
      console.log('Anamnese criada:', result);
      toast.success('Anamnese criada com sucesso!');
      navigate('/admin/anamnese');
      
    } catch (error: any) {
      console.error('Erro ao criar anamnese:', error);
      toast.error(error.message || 'Erro ao criar anamnese. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bravo-blue mb-2">
            Criar Nova Anamnese
          </h1>
          <p className="text-gray-600">
            Crie um novo formulário de anamnese para ser utilizado na avaliação de pacientes
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/anamnese')}>
          <ArrowLeft size={16} className="mr-2" />
          Voltar
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Informações da Anamnese</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para configurar a anamnese
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Título da anamnese"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição da anamnese"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm mt-8">
        <CardHeader>
          <CardTitle>Perguntas</CardTitle>
          <CardDescription>
            Adicione as perguntas que farão parte da anamnese
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="question">Pergunta</Label>
            <Input
              id="question"
              placeholder="Texto da pergunta"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">Tipo de Pergunta</Label>
            <Select 
              defaultValue="text" 
              onValueChange={(value) => setQuestionType(value as QuestionType)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tipo de pergunta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="number">Número</SelectItem>
                <SelectItem value="boolean">Sim/Não</SelectItem>
                <SelectItem value="single-choice">Escolha única</SelectItem>
                <SelectItem value="multiple-choice">Múltipla escolha</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(questionType === 'single-choice' || questionType === 'multiple-choice') && (
            <div className="grid gap-2">
              <Label>Opções</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nova opção"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  disabled={isLoading}
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={addOption}
                  disabled={isLoading}
                >
                  Adicionar
                </Button>
              </div>
              {options.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {options.map((option) => (
                    <Badge key={option} className="gap-1 flex items-center">
                      {option}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removeOption(option)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button 
            type="button" 
            onClick={addQuestion}
            disabled={isLoading}
          >
            <Plus size={16} className="mr-2" />
            Adicionar Pergunta
          </Button>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <Card className="shadow-sm mt-8">
          <CardHeader>
            <CardTitle>Lista de Perguntas</CardTitle>
            <CardDescription>
              Visualize e gerencie as perguntas adicionadas
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {questions.map((question) => (
              <div key={question.id} className="border rounded-md p-4">
                <div className="font-medium">{question.text}</div>
                <div className="text-sm text-gray-500">
                  Tipo: {question.type}
                  {question.type === 'single-choice' || question.type === 'multiple-choice' ? (
                    <>
                      <br />
                      Opções: {question.options?.join(', ')}
                    </>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeQuestion(question.id)}
                  className="mt-2"
                  disabled={isLoading}
                >
                  Remover
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : 'Salvar Anamnese'}
        </Button>
      </div>
    </div>
  );
};

export default AdminAnamneseCreate;