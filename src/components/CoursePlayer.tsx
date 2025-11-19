
import React, { useState, useMemo } from 'react';
import { Course, CourseModule, Flashcard, QuizQuestion, ActivityType, ClozeTest, CaseStudy, SummaryActivity, MindMapActivity, ComparisonActivity, SelfExplanationActivity, SelfExplanationResult } from '../types';
import { ArrowLeft, CheckCircle, ChevronRight, RotateCw, Award, BookOpen, BrainCircuit, AlertTriangle, Zap, ListCheck, Check, X, GitFork, Scale, PenTool, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import * as GeminiService from '../services/geminiService';

interface CoursePlayerProps {
  course: Course;
  onBack: () => void;
  onCompleteModule: (moduleId: string, score?: number) => void | Promise<void>;
}

const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, onBack, onCompleteModule }) => {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  const activeModule = course.modules.find(m => m.id === activeModuleId);

  const handleStartModule = (id: string) => setActiveModuleId(id);

  const handleModuleFinished = async (score?: number) => {
    if (activeModuleId) {
      await onCompleteModule(activeModuleId, score);
      setActiveModuleId(null);
    }
  };

  if (activeModule) {
    return (
      <div className="fixed inset-0 bg-[#f6f8f8] z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <button onClick={() => setActiveModuleId(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm">
            <ArrowLeft className="w-5 h-5" /> Cancelar
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs text-primary-dark font-bold uppercase tracking-widest mb-0.5">{activeModule.type}</span>
            <span className="text-base font-bold text-gray-900">{activeModule.title}</span>
          </div>
          <div className="w-24 flex justify-end">
            <div className="flex items-center gap-1 text-accent-badge font-bold text-sm bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
              <Zap className="w-4 h-4 fill-current" /> +{activeModule.xpReward}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-[#f6f8f8]">
          <div className="w-full max-w-4xl mx-auto">
            {activeModule.type === ActivityType.SUMMARY && (
              <SummaryViewer data={activeModule.content as SummaryActivity} onComplete={handleModuleFinished} />
            )}
            {activeModule.type === ActivityType.FLASHCARD && (
              <ActiveFlashcardDeck cards={activeModule.content as Flashcard[]} onComplete={handleModuleFinished} />
            )}
            {(activeModule.type === ActivityType.QUIZ || activeModule.type === ActivityType.SIMULATION) && (
              <QuizPlayer
                questions={activeModule.content as QuizQuestion[]}
                isSimulation={activeModule.type === ActivityType.SIMULATION}
                onComplete={handleModuleFinished}
              />
            )}
            {activeModule.type === ActivityType.CLOZE && (
              <ClozePlayer data={activeModule.content as ClozeTest} onComplete={handleModuleFinished} />
            )}
            {activeModule.type === ActivityType.CASE_STUDY && (
              <CaseStudyPlayer data={activeModule.content as CaseStudy} onComplete={handleModuleFinished} />
            )}
            {activeModule.type === ActivityType.MAP_MENTAL && (
              <MindMapPlayer data={activeModule.content as MindMapActivity} onComplete={handleModuleFinished} />
            )}
            {activeModule.type === ActivityType.COMPARISON && (
              <ComparisonPlayer data={activeModule.content as ComparisonActivity} onComplete={handleModuleFinished} />
            )}
            {activeModule.type === ActivityType.SELF_EXPLANATION && (
              <SelfExplanationPlayer data={activeModule.content as SelfExplanationActivity} onComplete={handleModuleFinished} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f6f8f8]">
      {/* Course Header */}
      <div className="relative h-[300px] w-full bg-background-dark overflow-hidden">
        <img src={course.thumbnailUrl} className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10221f] via-[#10221f]/80 to-transparent" />
        <div className="absolute top-6 left-6">
          <button onClick={onBack} className="flex items-center gap-2 text-white/70 hover:text-white font-medium bg-black/20 backdrop-blur-md px-4 py-2 rounded-full transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        </div>
        <div className="absolute bottom-0 left-0 w-full max-w-5xl p-6 sm:p-8 lg:p-10">
          <h1 className="text-4xl font-bold text-white mb-2">{course.title}</h1>
          <div className="flex items-center gap-4 text-gray-300">
            <span className="font-bold text-primary">{course.progress}% Completo</span>
            <span>{course.totalXP} XP Total</span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 py-10 pb-20 sm:px-6 lg:px-10">
        {/* Conteúdo do Curso */}
        {course.content && (
          <div className="mb-12 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Conteúdo do Curso</h2>
              </div>
              <p className="text-sm text-gray-600 mt-2">Material de estudo e referência</p>
            </div>
            <div className="p-8 prose prose-lg max-w-none">
              <ReactMarkdown>{course.content}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Atividades/Tarefas do Curso */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <ListCheck className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">Atividades e Exercícios</h2>
            </div>
            <p className="text-sm text-gray-600">Complete as atividades para progredir no curso</p>
          </div>

          <div className="relative space-y-8">
            <div className="absolute left-9 top-8 bottom-8 w-1 bg-gray-200 rounded-full -z-10"></div>
            {course.modules.map((module, idx) => {
              const isLocked = idx > 0 && !course.modules[idx - 1].isCompleted;
              return (
                <div key={module.id} onClick={() => !isLocked && handleStartModule(module.id)}
                  className={`relative flex items-center gap-6 transition-all duration-300 group ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:translate-x-2'}`}>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center shrink-0 border-4 shadow-lg z-10 ${module.isCompleted ? 'bg-green-500 border-green-200 text-white' : 'bg-white border-primary text-primary'}`}>
                    {module.isCompleted ? <CheckCircle className="w-8 h-8" /> : <Zap className="w-8 h-8 fill-current" />}
                  </div>
                  <div className="flex-1 p-6 rounded-2xl border border-gray-100 shadow-sm bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{module.type}</span>
                      {module.score !== undefined && module.isCompleted && <span className="text-xs font-bold text-green-600">Nota: {module.score}</span>}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
                    {module.description && <p className="text-sm text-gray-600 mt-1">{module.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 1. Active Flashcards (MCQ / VF) ---
const ActiveFlashcardDeck: React.FC<{ cards: Flashcard[]; onComplete: (score: number) => void }> = ({ cards, onComplete }) => {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null); // For MCQ
  const [vfSelection, setVfSelection] = useState<boolean | null>(null); // For VF
  const [correctCount, setCorrectCount] = useState(0);

  if (!cards || !Array.isArray(cards) || cards.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>Nenhum flashcard disponível para esta atividade.</p>
        <button onClick={() => onComplete(100)} className="mt-4 text-primary font-bold hover:underline">Concluir</button>
      </div>
    );
  }

  const card = cards[index];
  if (!card) return null;

  const progress = ((index) / cards.length) * 100;

  const handleSubmit = () => {
    let isCorrect = false;
    if (card.mode === 'mcq' && selectedOption === card.correctOptionIndex) isCorrect = true;
    if (card.mode === 'vf' && vfSelection === card.isTrue) isCorrect = true;

    if (isCorrect) setCorrectCount(c => c + 1);
    setIsFlipped(true);
  };

  const handleNext = () => {
    if (index < cards.length - 1) {
      setIndex(i => i + 1);
      setIsFlipped(false);
      setSelectedOption(null);
      setVfSelection(null);
    } else {
      const score = Math.round((correctCount / cards.length) * 100);
      onComplete(score);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6 h-2 bg-gray-200 rounded-full"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }}></div></div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
        {!isFlipped ? (
          <div className="flex h-full flex-col p-6 sm:p-8 lg:p-10">
            <div className="flex-1 text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-8">{card.front}</h3>

              {card.mode === 'mcq' && card.options && (
                <div className="space-y-3 text-left">
                  {card.options.map((opt, i) => (
                    <button key={i} onClick={() => setSelectedOption(i)}
                      className={`w-full p-4 rounded-xl border-2 text-sm font-bold transition-all ${selectedOption === i ? 'border-primary bg-primary/10' : 'border-gray-100 hover:border-gray-300'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {card.mode === 'vf' && card.vfStatement && (
                <div className="space-y-4">
                  <p className="text-lg font-medium text-gray-600">"{card.vfStatement}"</p>
                  <div className="flex gap-4">
                    <button onClick={() => setVfSelection(true)} className={`flex-1 p-4 rounded-xl border-2 font-bold ${vfSelection === true ? 'border-primary bg-primary/10' : 'border-gray-100'}`}>Verdadeiro</button>
                    <button onClick={() => setVfSelection(false)} className={`flex-1 p-4 rounded-xl border-2 font-bold ${vfSelection === false ? 'border-primary bg-primary/10' : 'border-gray-100'}`}>Falso</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleSubmit} disabled={selectedOption === null && vfSelection === null}
              className="mt-8 w-full bg-background-dark text-white py-4 rounded-xl font-bold disabled:opacity-50">
              Responder
            </button>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-background-dark p-6 text-center text-white sm:p-8 lg:p-10">
            <div className="mb-6">
              {(card.mode === 'mcq' && selectedOption === card.correctOptionIndex) || (card.mode === 'vf' && vfSelection === card.isTrue)
                ? <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto"><CheckCircle className="w-8 h-8" /></div>
                : <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto"><X className="w-8 h-8" /></div>
              }
            </div>
            <h3 className="text-2xl font-bold mb-4">{card.back}</h3>
            {card.sourceSnippet && (
              <p className="text-xs text-gray-400 italic max-w-md">Fonte: "{card.sourceSnippet}"</p>
            )}
            <button onClick={handleNext} className="mt-8 rounded-xl bg-primary px-5 py-3 font-bold text-background-dark sm:px-8">
              {index < cards.length - 1 ? 'Próximo Card' : 'Finalizar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- 2. Mind Map (Association) ---
const MindMapPlayer: React.FC<{ data: MindMapActivity; onComplete: (score: number) => void }> = ({ data, onComplete }) => {
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // nodeId -> parentId
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>Mapa mental vazio ou inválido.</p>
        <button onClick={() => onComplete(100)} className="mt-4 text-primary font-bold hover:underline">Concluir</button>
      </div>
    );
  }

  const items = useMemo(() => data.nodes.filter(n => n.parentId), [data]); // Draggable items
  const targets = useMemo(() => data.nodes.filter(n => !n.parentId || items.some(i => i.parentId === n.id)), [data, items]); // Possible parents

  const handleAssign = (targetId: string) => {
    if (selectedNode) {
      setAssignments(prev => ({ ...prev, [selectedNode]: targetId }));
      setSelectedNode(null);
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    items.forEach(item => {
      if (assignments[item.id] === item.parentId) correct++;
    });
    onComplete(Math.round((correct / items.length) * 100));
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl min-h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><GitFork className="w-5 h-5" /> Construa o Mapa Mental</h3>
        <button onClick={handleSubmit} disabled={Object.keys(assignments).length !== items.length} className="bg-primary text-background-dark px-6 py-2 rounded-lg font-bold disabled:opacity-50">Verificar</button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Sidebar: Unassigned Items */}
        <div className="col-span-1 bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase">Conceitos Soltos</p>
          {items.map(node => {
            const isAssigned = !!assignments[node.id];
            if (isAssigned) return null;
            return (
              <div key={node.id} onClick={() => setSelectedNode(node.id)}
                className={`p-3 rounded-xl border-2 font-medium cursor-pointer text-sm bg-white shadow-sm ${selectedNode === node.id ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'}`}>
                {node.label}
              </div>
            )
          })}
        </div>

        {/* Main Area: Tree Structure */}
        <div className="col-span-2 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center gap-6">
          <div className="bg-background-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg">{data.rootLabel}</div>
          {/* Simplified Visualization for Demo */}
          <div className="flex flex-wrap justify-center gap-4">
            {data.nodes.filter(n => !n.parentId).map(rootNode => (
              <div key={rootNode.id} className="flex flex-col items-center gap-4">
                <div onClick={() => handleAssign(rootNode.id)}
                  className={`px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-bold text-gray-700 ${selectedNode ? 'border-dashed border-primary bg-primary/5 cursor-pointer animate-pulse' : ''}`}>
                  {rootNode.label}
                </div>
                {/* Children */}
                <div className="flex flex-col gap-2">
                  {Object.entries(assignments).filter(([_, pId]) => pId === rootNode.id).map(([cId, _]) => (
                    <div key={cId} onClick={() => {
                      const newA = { ...assignments };
                      delete newA[cId];
                      setAssignments(newA);
                    }} className="text-xs bg-white px-3 py-1.5 rounded border border-green-200 text-green-700 shadow-sm cursor-pointer hover:bg-red-50 hover:text-red-600">
                      {items.find(i => i.id === cId)?.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 3. Cloze Test (Strict String Matching) ---
const ClozePlayer: React.FC<{ data: ClozeTest; onComplete: (score: number) => void }> = ({ data, onComplete }) => {
  const [inputs, setInputs] = useState<string[]>([]);

  if (!data || !data.textWithBlanks) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>Cloze test inválido.</p>
        <button onClick={() => onComplete(100)} className="mt-4 text-primary font-bold hover:underline">Concluir</button>
      </div>
    );
  }

  const parts = data.textWithBlanks.split("{{blank}}");

  const handleCheck = () => {
    let correct = 0;
    data.answers.forEach((ans, i) => {
      if (inputs[i]?.trim().toLowerCase() === ans.trim().toLowerCase()) correct++;
    });
    onComplete(Math.round((correct / data.answers.length) * 100));
  };

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-6 shadow-xl sm:p-8 lg:p-10">
      <div className="text-2xl leading-loose font-medium text-gray-800">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <input type="text"
                onChange={(e) => {
                  const newInputs = [...inputs];
                  newInputs[index] = e.target.value;
                  setInputs(newInputs);
                }}
                className="mx-1 border-b-2 border-gray-300 focus:border-primary outline-none px-2 py-0 w-32 text-center font-bold bg-gray-50 focus:bg-white" placeholder="..." />
            )}
          </React.Fragment>
        ))}
      </div>
      <button onClick={handleCheck} className="mt-10 w-full bg-background-dark text-white py-4 rounded-xl font-bold">Verificar Respostas</button>
    </div>
  );
};

// --- 4. Case Study (Weighted Scoring) ---
const CaseStudyPlayer: React.FC<{ data: CaseStudy; onComplete: (score: number) => void }> = ({ data, onComplete }) => {
  const [selectedType, setSelectedType] = useState<'correct' | 'risk' | 'wrong' | null>(null);

  if (!data || !data.options || data.options.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>Estudo de caso incompleto.</p>
        <button onClick={() => onComplete(100)} className="mt-4 text-primary font-bold hover:underline">Concluir</button>
      </div>
    );
  }

  const handleFinish = () => {
    if (!selectedType) return;
    let score = 0;
    if (selectedType === 'correct') score = 100;
    if (selectedType === 'risk') score = 60;
    onComplete(score);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden">
      <div className="bg-orange-50 p-8 border-b border-orange-100">
        <div className="flex items-center gap-2 text-orange-600 font-bold uppercase text-sm mb-4"><AlertTriangle className="w-4 h-4" /> Estudo de Caso</div>
        <p className="text-xl font-medium text-gray-900">{data.scenario}</p>
      </div>
      <div className="p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-6">{data.question}</h3>
        <div className="space-y-4">
          {data.options.map((opt, idx) => (
            <div key={idx} onClick={() => !selectedType && setSelectedType(opt.type)}
              className={`p-6 rounded-2xl border-2 transition-all ${selectedType ? 'cursor-default' : 'cursor-pointer hover:border-primary'}
              ${selectedType && selectedType === opt.type ? (opt.type === 'correct' ? 'bg-green-50 border-green-500' : opt.type === 'risk' ? 'bg-orange-50 border-orange-500' : 'bg-red-50 border-red-500') : 'border-gray-200'}`}>
              <div className="font-bold text-gray-800 text-lg">{opt.text}</div>
              {selectedType && (
                <div className={`mt-2 text-sm font-bold ${opt.type === 'correct' ? 'text-green-700' : opt.type === 'risk' ? 'text-orange-700' : 'text-red-700'}`}>
                  Feedback: {opt.feedback}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {selectedType && (
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button onClick={handleFinish} className="rounded-xl bg-primary px-5 py-3 font-bold text-background-dark sm:px-8">Concluir</button>
        </div>
      )}
    </div>
  );
};

// --- 5. Comparison Table ---
const ComparisonPlayer: React.FC<{ data: ComparisonActivity; onComplete: (score: number) => void }> = ({ data, onComplete }) => {
  const [placements, setPlacements] = useState<Record<string, string>>({}); // itemId -> columnId

  if (!data || !data.items || !data.columns) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>Atividade de comparação inválida.</p>
        <button onClick={() => onComplete(100)} className="mt-4 text-primary font-bold hover:underline">Concluir</button>
      </div>
    );
  }

  const handlePlace = (itemId: string, colId: string) => {
    setPlacements(prev => ({ ...prev, [itemId]: colId }));
  };

  const handleSubmit = () => {
    let correct = 0;
    data.items.forEach(item => {
      if (placements[item.id] === item.correctColumnId) correct++;
    });
    onComplete(Math.round((correct / data.items.length) * 100));
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Scale className="w-5 h-5" /> Categorize os itens</h3>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {data.columns.map(col => (
          <div key={col.id} className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300 min-h-[200px]">
            <div className="text-center font-bold text-gray-700 mb-4 uppercase text-sm tracking-wider">{col.label}</div>
            <div className="space-y-2">
              {data.items.filter(item => placements[item.id] === col.id).map(item => (
                <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex justify-between items-center">
                  {item.text}
                  <button onClick={() => { const n = { ...placements }; delete n[item.id]; setPlacements(n); }} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {data.items.filter(item => !placements[item.id]).map(item => (
          <div key={item.id} className="group relative bg-white border-2 border-primary text-primary-dark font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all cursor-default">
            {item.text}
            <div className="absolute -top-10 left-0 hidden group-hover:flex bg-gray-800 text-white rounded-lg overflow-hidden shadow-xl z-10">
              {data.columns.map(col => (
                <button key={col.id} onClick={() => handlePlace(item.id, col.id)} className="px-3 py-2 hover:bg-gray-700 text-xs whitespace-nowrap border-r border-700 last:border-0">
                  To: {col.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={Object.keys(placements).length !== data.items.length} className="w-full bg-background-dark text-white py-3 rounded-xl font-bold disabled:opacity-50">
        Verificar Classificação
      </button>
    </div>
  );
};

// --- 6. Self-Explanation (AI Graded) ---
const SelfExplanationPlayer: React.FC<{ data: SelfExplanationActivity; onComplete: (score: number) => void }> = ({ data, onComplete }) => {
  const [answer, setAnswer] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<SelfExplanationResult | null>(null);

  if (!data) return null;

  const handleEvaluate = async () => {
    if (answer.split(' ').length < data.minWords) {
      alert(`Por favor, escreva pelo menos ${data.minWords} palavras.`);
      return;
    }
    setIsGrading(true);
    const grading = await GeminiService.evaluateSelfExplanation(answer, data.sourceReference);
    setResult(grading);
    setIsGrading(false);
  };

  if (result) {
    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-2xl mx-auto text-center">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${result.score >= 70 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
          <span className="text-2xl font-bold">{result.score}</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{result.score >= 70 ? 'Boa explicação!' : 'Podemos melhorar'}</h2>
        <p className="text-gray-600 mb-6">{result.feedback}</p>

        {result.missingPoints.length > 0 && (
          <div className="bg-red-50 p-4 rounded-xl text-left mb-6 border border-red-100">
            <p className="font-bold text-red-800 mb-2 text-sm uppercase">Pontos Faltantes:</p>
            <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
              {result.missingPoints.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
        )}

        <button onClick={() => onComplete(result.score)} className="rounded-xl bg-primary px-5 py-3 font-bold text-background-dark sm:px-8">Continuar</button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-purple-600 font-bold uppercase text-sm mb-4"><PenTool className="w-4 h-4" /> Auto-Explicação</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{data.prompt}</h3>
      <p className="text-sm text-gray-500 mb-6">Escreva com suas palavras. Mínimo {data.minWords} palavras.</p>

      <textarea
        value={answer} onChange={e => setAnswer(e.target.value)}
        className="w-full h-48 p-4 rounded-xl border-2 border-gray-200 focus:border-primary outline-none resize-none text-lg leading-relaxed"
        placeholder="Comece sua explicação..."
      />

      <div className="mt-6 flex justify-end">
        <button onClick={handleEvaluate} disabled={isGrading} className="flex items-center gap-2 rounded-xl bg-background-dark px-5 py-3 font-bold text-white sm:px-8">
          {isGrading ? <><Loader2 className="w-4 h-4 animate-spin" /> Avaliando...</> : 'Avaliar com IA'}
        </button>
      </div>
    </div>
  );
};

// --- 7. Summary Viewer (Existing logic, strict scoring) ---
const SummaryViewer: React.FC<{ data: SummaryActivity; onComplete: (score: number) => void }> = ({ data, onComplete }) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  if (!data || !data.correctStatements || !data.distractors) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>Resumo incompleto.</p>
        <button onClick={() => onComplete(100)} className="mt-4 text-primary font-bold hover:underline">Concluir</button>
      </div>
    );
  }

  const options = useMemo(() => [...data.correctStatements, ...data.distractors].sort(() => Math.random() - 0.5), [data]);

  const finish = () => {
    const correctCount = selectedItems.filter(item => data.correctStatements.includes(item)).length;
    onComplete(Math.round((correctCount / 3) * 100));
  };

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-6 shadow-xl sm:p-8 lg:p-10">
      <div className="prose prose-sm mb-8 max-h-60 overflow-y-auto p-4 bg-gray-50 rounded-xl"><ReactMarkdown>{data.markdownContent}</ReactMarkdown></div>
      <h3 className="font-bold text-lg mb-4">Verifique seu entendimento (Escolha 3 corretas):</h3>
      <div className="space-y-2 mb-6">
        {options.map((opt, i) => (
          <div key={i} onClick={() => !hasSubmitted && setSelectedItems(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : prev.length < 3 ? [...prev, opt] : prev)}
            className={`p-3 border-2 rounded-lg cursor-pointer ${selectedItems.includes(opt) ? 'border-primary bg-primary/10' : 'border-gray-200'} ${hasSubmitted && data.correctStatements.includes(opt) ? 'bg-green-100 border-green-500' : ''}`}>
            {opt}
          </div>
        ))}
      </div>
      <button onClick={() => hasSubmitted ? finish() : setHasSubmitted(true)} className="w-full bg-background-dark text-white py-3 rounded-xl font-bold">
        {hasSubmitted ? 'Continuar' : 'Verificar'}
      </button>
    </div>
  );
};

// --- 8. Quiz / Simulation ---
const QuizPlayer: React.FC<{ questions: QuizQuestion[]; isSimulation: boolean; onComplete: (score: number) => void }> = ({ questions, isSimulation, onComplete }) => {
  const [answers, setAnswers] = useState<number[]>(new Array(questions?.length || 0).fill(-1));
  const [submitted, setSubmitted] = useState(false);

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>Nenhuma questão disponível.</p>
        <button onClick={() => onComplete(100)} className="mt-4 text-primary font-bold hover:underline">Concluir</button>
      </div>
    );
  }

  const handleOptionSelect = (qIndex: number, optIndex: number) => {
    if (submitted && !isSimulation) return;
    const newAnswers = [...answers];
    newAnswers[qIndex] = optIndex;
    setAnswers(newAnswers);
  };

  const finish = () => {
    let correct = 0;
    answers.forEach((ans, i) => { if (ans === questions[i].correctAnswerIndex) correct++; });
    const score = Math.round((correct / questions.length) * 100);
    onComplete(score);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {questions.map((q, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">{i + 1}. {q.question}</h3>
          <div className="space-y-2">
            {q.options.map((opt, optIdx) => (
              <button key={optIdx} onClick={() => handleOptionSelect(i, optIdx)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${answers[i] === optIdx ? 'border-primary bg-primary/10' : 'border-gray-200'}
                            ${submitted && !isSimulation && optIdx === q.correctAnswerIndex ? 'border-green-500 bg-green-50' : ''}
                            ${submitted && !isSimulation && answers[i] === optIdx && answers[i] !== q.correctAnswerIndex ? 'border-red-500 bg-red-50' : ''}`}>
                {opt}
              </button>
            ))}
          </div>
          {submitted && !isSimulation && (
            <div className="mt-3 text-sm bg-blue-50 text-blue-800 p-3 rounded-lg">{q.explanation}</div>
          )}
          {/* Transparency Layer 4: Show snippet in review/study mode if needed, or keep hidden for tests */}
        </div>
      ))}
      <button onClick={() => isSimulation || submitted ? finish() : setSubmitted(true)} className="w-full bg-background-dark text-white py-4 rounded-xl font-bold shadow-xl">
        {isSimulation ? 'Finalizar Simulado' : submitted ? 'Concluir' : 'Verificar Respostas'}
      </button>
    </div>
  );
};

export default CoursePlayer;
