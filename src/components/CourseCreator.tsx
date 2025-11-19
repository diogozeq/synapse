
import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, BrainCircuit, Edit3, AlertCircle, LayoutGrid, GitFork, Scale, PenTool, CheckCircle, Eye, Trash2, RefreshCw, ShieldCheck, AlertTriangle, ArrowUp, ArrowDown, Upload } from 'lucide-react';
import * as GeminiService from '../services/geminiService';
import { Course, CourseModule, ActivityType, Flashcard, QuizQuestion, ComparisonActivity } from '../types';

interface CourseCreatorProps {
  onCourseCreated: (course: Course) => Promise<void>;
  isSaving?: boolean;
}

const SAMPLE_TEXT = `
Política de Segurança da Informação - Synapse Corp

1. Introdução
A segurança da informação é vital para a continuidade dos negócios. Todos devem proteger informações contra acesso não autorizado.

2. Senhas
Mínimo 12 caracteres, complexas. 2FA obrigatório. Nunca compartilhe.

3. Classificação de Dados
- Pública: Aberta.
- Interna: Colaboradores.
- Confidencial: Restrita.
- Secreta: Crítica.

4. Incidentes
Reportar em até 1 hora para security@synapse.com.
`;

const CourseCreator: React.FC<CourseCreatorProps> = ({ onCourseCreated, isSaving }) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'generating' | 'review'>('upload');
  const [text, setText] = useState('');
  const [status, setStatus] = useState<string>('');
  const [metadata, setMetadata] = useState<{ title: string; description: string; category: string; tags: string[] } | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formType, setFormType] = useState<'Obrigatório' | 'Recomendado'>('Recomendado');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [generatedModules, setGeneratedModules] = useState<CourseModule[]>([]);
  const [moduleEnabled, setModuleEnabled] = useState<Record<string, boolean>>({});
  const [moduleXP, setModuleXP] = useState<Record<string, number>>({});
  const [formDifficulty, setFormDifficulty] = useState<string>('Intermediário');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileProcessingStatus, setFileProcessingStatus] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('course_source_text');
    if (saved) setText(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem('course_source_text', text);
  }, [text]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setFileProcessingStatus('Processando arquivo...');

    try {
      // Para arquivos de texto simples
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setText(content);
          setFileProcessingStatus('Arquivo carregado com sucesso!');
          setTimeout(() => {
            setIsProcessingFile(false);
            setFileProcessingStatus('');
          }, 2000);
        };
        reader.readAsText(file);
      }
      // Para PDFs e DOCs, enviar para o backend fazer OCR/extração
      else if (file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        setFileProcessingStatus('Extraindo texto do documento...');

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/extract-text`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Falha ao extrair texto do arquivo');
        }

        const data = await response.json();
        setText(data.text || data.content || '');
        setFileProcessingStatus('Texto extraído com sucesso!');
        setTimeout(() => {
          setIsProcessingFile(false);
          setFileProcessingStatus('');
        }, 2000);
      } else {
        throw new Error('Formato de arquivo não suportado');
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setFileProcessingStatus('❌ Erro ao processar arquivo. Tente novamente ou cole o texto manualmente.');
      setTimeout(() => {
        setIsProcessingFile(false);
        setFileProcessingStatus('');
      }, 4000);
    }
  };
  const moveModule = (id: string, direction: 'up' | 'down') => {
    setGeneratedModules(prev => {
      const index = prev.findIndex(m => m.id === id);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setStep('generating');
    setStatus('Analisando estrutura e pedagogia...');
    try {
      const meta = await GeminiService.generateCourseMetadata(text);
      setMetadata(meta);
      setFormTitle(meta.title || '');
      setFormDescription(meta.description || '');
      setFormCategory(meta.category || '');
      setFormType('Recomendado');
      setThumbnailPreview(`https://picsum.photos/seed/${meta.title.length}/800/600`);
      setStep('preview');
    } catch (e) {
      setStatus('Erro na análise.');
      setStep('upload');
    }
  };

  const handleGenerate = async () => {
    if (!metadata || !text.trim()) {
      setStatus('Erro: Conteúdo fonte vazio.');
      return;
    }
    setStep('generating');
    setStatus('Gerando atividades (Camada 1: Prompt Restritivo)...');

    try {
      const [summary, flashcards, quiz, cloze, caseStudy, mindMap, comparison] = await Promise.all([
        GeminiService.generateSummary(text),
        GeminiService.generateActiveFlashcards(text),
        GeminiService.generateQuiz(text),
        GeminiService.generateClozeTest(text),
        GeminiService.generateCaseStudy(text),
        GeminiService.generateMindMap(text),
        GeminiService.generateComparison(text)
      ]);

      // Camada 2: Validação por IA (Example for Quiz & Flashcards)
      setStatus('Validando conteúdo (Camada 2: Auditoria AI)...');

      // Validate Quiz
      const quizValidation = await GeminiService.validateGeneratedContent(text, JSON.stringify(quiz));
      const validQuiz = quiz.length > 0 ? quiz.filter((_, i) => quizValidation.validIndices.includes(i)) : quiz;

      // Validate Flashcards
      const fcValidation = await GeminiService.validateGeneratedContent(text, JSON.stringify(flashcards));
      const validFlashcards = flashcards.length > 0 ? flashcards.filter((_, i) => fcValidation.validIndices.includes(i)) : flashcards;

      const modules: CourseModule[] = [
        {
          id: 'm1', type: ActivityType.SUMMARY, title: 'Leitura & Verificação',
          description: 'Entendimento inicial', content: summary, isCompleted: false, xpReward: 50, estimatedTimeMin: 3
        },
        {
          id: 'm2', type: ActivityType.FLASHCARD, title: 'Active Recall',
          description: 'Desafios de memória rápida', content: validFlashcards, isCompleted: false, xpReward: 100, estimatedTimeMin: 5
        },
        {
          id: 'm3', type: ActivityType.MAP_MENTAL, title: 'Mapa Mental',
          description: 'Conecte os conceitos', content: mindMap, isCompleted: false, xpReward: 150, estimatedTimeMin: 5
        },
        {
          id: 'm4', type: ActivityType.COMPARISON, title: 'Tabela Comparativa',
          description: 'Categorize os itens', content: comparison, isCompleted: false, xpReward: 150, estimatedTimeMin: 4
        },
        {
          id: 'm5', type: ActivityType.CLOZE, title: 'Cloze Test',
          description: 'Preencha as lacunas', content: cloze, isCompleted: false, xpReward: 200, estimatedTimeMin: 4
        },
        {
          id: 'm6', type: ActivityType.CASE_STUDY, title: 'Estudo de Caso',
          description: 'Aplicação prática', content: caseStudy, isCompleted: false, xpReward: 300, estimatedTimeMin: 8
        },
        {
          id: 'm7', type: ActivityType.SELF_EXPLANATION, title: 'Auto-Explicação',
          description: 'Explique com suas palavras',
          content: { prompt: "Explique a política de classificação de dados e incidentes.", sourceReference: text, minWords: 20 },
          isCompleted: false, xpReward: 400, estimatedTimeMin: 10
        },
        {
          id: 'm8', type: ActivityType.SIMULATION, title: 'Simulado Final',
          description: 'Prova de certificação', content: validQuiz, isCompleted: false, score: 0, xpReward: 500, estimatedTimeMin: 15
        }
      ];

      setGeneratedModules(modules);
      const enabled: Record<string, boolean> = {};
      const xp: Record<string, number> = {};
      modules.forEach(m => { enabled[m.id] = true; xp[m.id] = m.xpReward; });
      setModuleEnabled(enabled);
      setModuleXP(xp);
      setStep('review'); // Move to Review instead of Finish
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      if (errorMessage.includes('400') || errorMessage.includes('API')) {
        setStatus('❌ Erro: Verifique se a chave da API Gemini está configurada no backend (.env)');
      } else {
        setStatus('Erro na geração. Verifique o console para mais detalhes.');
      }
      setStep('preview');
    }
  };

  const handlePublish = async () => {
    if (!metadata) return;
    setStatus('Publicando curso na base real...');
    const finalModules = generatedModules
      .filter(m => moduleEnabled[m.id])
      .map(m => ({ ...m, xpReward: moduleXP[m.id] ?? m.xpReward }));
    const newCourse: Course = {
      id: Date.now().toString(),
      title: formTitle.trim() || metadata.title,
      description: formDescription.trim() || metadata.description,
      category: formCategory.trim() || metadata.category,
      content: text, // Salvando o conteúdo original do curso
      tags: [...(metadata.tags || []), formDifficulty],
      modules: finalModules,
      progress: 0,
      totalXP: 0,
      thumbnailUrl: thumbnailPreview || `https://picsum.photos/seed/${metadata.title.length}/800/600`,
      createdAt: new Date().toISOString(),
      isRecommended: formType === 'Recomendado',
      status: formType
    };
    try {
      await onCourseCreated(newCourse);
      setStatus('Curso publicado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar curso', error);
      setStatus('Erro ao publicar curso. Tente novamente.');
    }
  };

  const handleDeleteItem = (moduleId: string, itemIndex: number) => {
    setGeneratedModules(prev => prev.map(m => {
      if (m.id !== moduleId) return m;

      // Handle Flashcards
      if (m.type === ActivityType.FLASHCARD) {
        const currentContent = m.content as Flashcard[];
        const newContent = [...currentContent];
        newContent.splice(itemIndex, 1);
        return { ...m, content: newContent };
      }

      // Handle Quiz / Simulation
      if (m.type === ActivityType.QUIZ || m.type === ActivityType.SIMULATION) {
        const currentContent = m.content as QuizQuestion[];
        const newContent = [...currentContent];
        newContent.splice(itemIndex, 1);
        return { ...m, content: newContent };
      }

      return m;
    }));
  };

  // --- Renderers ---

  if (step === 'generating') {
    const hasError = status.includes('Erro') || status.includes('❌');
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background-light px-4 py-8 text-center sm:px-6 lg:px-10">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <BrainCircuit className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">A IA está criando sua universidade...</h2>
        <p className={`${hasError ? 'text-red-600 font-bold' : 'text-gray-500'}`}>{status}</p>
        {hasError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl max-w-md">
            <p className="text-sm text-red-800">
              <strong>Instruções:</strong><br />
              1. Crie um arquivo <code className="bg-red-100 px-1 rounded">.env</code> no diretório <code className="bg-red-100 px-1 rounded">backend/</code><br />
              2. Adicione: <code className="bg-red-100 px-1 rounded">GEMINI_API_KEY=sua_chave_aqui</code><br />
              3. Obtenha sua chave em: <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-blue-600 underline">makersuite.google.com</a>
            </p>
          </div>
        )}
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-20 sm:px-6 lg:px-10">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Revisão do Gestor (Camada 3)</h1>
            <p className="text-gray-500">Valide o conteúdo gerado antes de publicar.</p>
          </div>
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold">Auditoria IA: Concluída</span>
          </div>
        </header>

        <div className="space-y-6">
          {generatedModules.map((module) => {
            const isList = Array.isArray(module.content);
            const count = isList ? (module.content as any[]).length : 1;
            if (count === 0) return null;

            return (
              <div key={module.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="bg-white text-xs font-bold px-2 py-1 rounded border border-gray-200 text-gray-500 uppercase">{module.type}</span>
                    <h3 className="font-bold text-gray-800">{module.title}</h3>
                    <span className="text-xs text-gray-400">({count} itens)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1 rounded border border-gray-200 hover:bg-gray-100"
                        onClick={() => moveModule(module.id, 'up')}
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="p-1 rounded border border-gray-200 hover:bg-gray-100"
                        onClick={() => moveModule(module.id, 'down')}
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600">
                      <input
                        type="checkbox"
                        checked={moduleEnabled[module.id] ?? true}
                        onChange={(e) => setModuleEnabled(prev => ({ ...prev, [module.id]: e.target.checked }))}
                      />
                      Incluir
                    </label>
                  </div>
                </div>
                <div className={`p-4 space-y-4 ${moduleEnabled[module.id] ? '' : 'opacity-50 pointer-events-none'}`}>
                  {/* Specialized render for list items (Quiz, Flashcards) to show source snippet */}
                  {module.type === ActivityType.FLASHCARD && Array.isArray(module.content) && (module.content as Flashcard[]).map((fc, i) => (
                    <div key={i} className="p-4 border border-gray-100 rounded-xl hover:border-primary/30 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-gray-800">{fc.front}</div>
                        <button onClick={() => handleDeleteItem(module.id, i)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="text-gray-600 mb-3 text-sm">{fc.back}</div>
                      {fc.sourceSnippet && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded flex gap-2 items-start">
                          <Eye className="w-3 h-3 mt-0.5 shrink-0" />
                          <span className="italic">Fonte: "{fc.sourceSnippet}"</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Quiz */}
                  {(module.type === ActivityType.QUIZ || module.type === ActivityType.SIMULATION) && Array.isArray(module.content) && (module.content as QuizQuestion[]).map((q, i) => (
                    <div key={i} className="p-4 border border-gray-100 rounded-xl hover:border-primary/30 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-gray-800"><span className="text-primary mr-2">Q{i + 1}</span> {q.question}</div>
                        <button onClick={() => handleDeleteItem(module.id, i)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="pl-6 text-sm text-gray-600 mb-2">✅ {q.options[q.correctAnswerIndex]}</div>
                      {q.sourceSnippet && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded flex gap-2 items-start ml-6">
                          <Eye className="w-3 h-3 mt-0.5 shrink-0" />
                          <span className="italic">Fonte: "{q.sourceSnippet}"</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Comparison */}
                  {module.type === ActivityType.COMPARISON && (module.content as ComparisonActivity)?.items && Array.isArray((module.content as ComparisonActivity).items) && (module.content as ComparisonActivity).items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg text-sm">
                      <span>{item.text}</span>
                      {item.sourceSnippet ?
                        <span className="text-xs text-gray-400 italic max-w-md truncate" title={item.sourceSnippet}>Fonte: {item.sourceSnippet}</span>
                        : <span className="text-xs text-orange-300 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Sem fonte</span>
                      }
                    </div>
                  ))}

                  {/* Fallback for others */}
                  {!['Flashcards Ativos', 'Quiz Objetivo', 'Simulado Final', 'Tabela Comparativa'].includes(module.type) && (
                    <div className="text-sm text-gray-500 italic">Visualização detalhada simplificada para revisão. Conteúdo gerado com sucesso.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 flex justify-end gap-4 z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          <button onClick={() => setStep('upload')} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100" disabled={isSaving}>Cancelar</button>
          <button
            onClick={handlePublish}
            disabled={isSaving}
            className={`px-8 py-3 rounded-xl font-bold bg-primary text-background-dark shadow-lg flex items-center gap-2 transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Publicando...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> Publicar Curso
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'preview' && metadata) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
          <div className="bg-background-dark p-6 text-white sm:p-8 lg:p-10">
            <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4" /> Plano de Curso Gerado
            </div>
            <div className="grid grid-cols-1 gap-4">
              <input
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-gray-300 focus:outline-none"
                placeholder="Nome do curso"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
              <textarea
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-gray-300 focus:outline-none"
                placeholder="Descrição curta"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2">
                  <img src={thumbnailPreview} className="w-full rounded-xl border border-white/20" alt="Capa do curso" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-white/80">Alterar capa</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setThumbnailPreview(url);
                      }
                    }}
                    className="text-xs text-white/80"
                  />
                  <input
                    type="url"
                    placeholder="Ou cole URL da imagem"
                    value={thumbnailPreview}
                    onChange={(e) => setThumbnailPreview(e.target.value)}
                    className="px-3 py-2 rounded bg-white/10 text-white placeholder:text-gray-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-10">
            <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-4">
              {['Resumo', 'Active Recall', 'Mapas', 'Simulados'].map((label, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  <div className="font-bold text-gray-900">{label}</div>
                  <div className="text-xs text-green-600 font-bold mt-1 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Ativado
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="text-sm font-bold text-gray-600">Categoria</label>
                <select
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-primary outline-none text-sm"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  <option value="">Escolha</option>
                  <option value="Obrigatórios">Obrigatórios</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Segurança">Segurança</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Soft Skills">Soft Skills</option>
                </select>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="text-sm font-bold text-gray-600">Tipo</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="radio" checked={formType === 'Obrigatório'} onChange={() => setFormType('Obrigatório')} /> Obrigatório
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="radio" checked={formType === 'Recomendado'} onChange={() => setFormType('Recomendado')} /> Recomendado
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="text-sm font-bold text-gray-600">Dificuldade</label>
                <select
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-primary outline-none text-sm"
                  value={formDifficulty}
                  onChange={(e) => setFormDifficulty(e.target.value)}
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setStep('upload')} className="w-full rounded-xl py-4 text-gray-500 font-bold hover:text-gray-700">Voltar</button>
              <button onClick={handleGenerate} className="flex-1 rounded-xl bg-primary py-4 text-lg font-bold text-background-dark shadow-xl shadow-primary/20 transition-all hover:bg-primary-dark sm:flex-[2] sm:py-4 flex items-center justify-center gap-2">
                <BrainCircuit className="w-5 h-5" /> Gerar & Validar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-10">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Criar Novo Curso</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Cole seu documento (PDF, DOCX, TXT) e deixe o Synapse transformar em uma experiência completa de Active Learning.
        </p>
      </header>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-gray-200 bg-gray-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-700">
            <FileText className="w-5 h-5 text-blue-500" />
            Conteúdo Fonte
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto">
              <Upload className="w-4 h-4" />
              Upload de Arquivo
              <input
                type="file"
                accept=".txt,.md,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button onClick={() => setText(SAMPLE_TEXT)} className="text-left text-sm font-bold text-primary-dark hover:underline sm:text-right">
              Carregar Exemplo
            </button>
          </div>
        </div>
        <textarea
          className="h-96 w-full resize-none bg-white p-4 text-lg font-light leading-relaxed text-gray-700 focus:outline-none sm:p-6 lg:p-8"
          placeholder="Cole o conteúdo aqui ou faça upload de um arquivo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 p-6 sm:flex-row sm:justify-end">
          {/* File Processing Status */}
          {isProcessingFile && fileProcessingStatus && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold">
              <RefreshCw className="w-4 h-4 animate-spin" />
              {fileProcessingStatus}
            </div>
          )}
          {!isProcessingFile && fileProcessingStatus && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${fileProcessingStatus.includes('❌')
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-green-50 border border-green-200 text-green-700'
              }`}>
              {fileProcessingStatus.includes('❌') ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {fileProcessingStatus}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!text.trim() || isProcessingFile}
            className={`flex w-full items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-bold text-white transition-all
              ${!text.trim() || isProcessingFile ? 'cursor-not-allowed bg-gray-300' : 'bg-background-dark hover:-translate-y-1 hover:bg-black shadow-xl'}
            `}
          >
            <Sparkles className="w-5 h-5 text-primary" />
            Analisar com IA
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCreator;
