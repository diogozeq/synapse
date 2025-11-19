import { Award, AlertCircle, Users, Trophy, Flame } from 'lucide-react';

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface QuickFiltersProps {
  onFilterClick: (filterId: string) => void;
}

const quickFilters: QuickFilter[] = [
  {
    id: 'top-performers',
    label: 'Top Performers',
    icon: <Trophy className="w-4 h-4" />,
    description: 'Taxa de conclusão > 80%',
  },
  {
    id: 'needs-attention',
    label: 'Precisa Atenção',
    icon: <AlertCircle className="w-4 h-4" />,
    description: 'Com cursos atrasados',
  },
  {
    id: 'newbies',
    label: 'Novatos',
    icon: <Users className="w-4 h-4" />,
    description: 'Nível 1-3',
  },
  {
    id: 'veterans',
    label: 'Veteranos',
    icon: <Award className="w-4 h-4" />,
    description: 'Nível 7+',
  },
  {
    id: 'high-streak',
    label: 'Alta Sequência',
    icon: <Flame className="w-4 h-4" />,
    description: '7+ dias consecutivos',
  },
];

export function QuickFilters({ onFilterClick }: QuickFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {quickFilters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterClick(filter.id)}
          className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-[#13ecc8] hover:bg-[#13ecc8]/5 transition-all"
          title={filter.description}
        >
          <div className="text-gray-500 group-hover:text-[#13ecc8] transition-colors">
            {filter.icon}
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-[#13ecc8] transition-colors">
            {filter.label}
          </span>
        </button>
      ))}
    </div>
  );
}
