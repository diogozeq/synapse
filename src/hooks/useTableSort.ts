import { useState, useMemo, useCallback } from 'react';
import { SortConfig, SortDirection, SortField, CollaboratorWithStats } from '../types';

interface UseTableSortProps {
  data: CollaboratorWithStats[];
}

export function useTableSort({ data }: UseTableSortProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc',
  });

  // Sort data based on current config
  const sortedData = useMemo(() => {
    const sorted = [...data];

    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'team':
          aValue = a.team?.name.toLowerCase() || '';
          bValue = b.team?.name.toLowerCase() || '';
          break;
        case 'role':
          aValue = a.role.toLowerCase();
          bValue = b.role.toLowerCase();
          break;
        case 'totalXP':
          aValue = a.totalXP;
          bValue = b.totalXP;
          break;
        case 'level':
          aValue = a.level;
          bValue = b.level;
          break;
        case 'completionRate':
          aValue = a.completionRate;
          bValue = b.completionRate;
          break;
        case 'coursesLate':
          aValue = a.coursesLate;
          bValue = b.coursesLate;
          break;
        case 'lastAccessAt':
          aValue = a.lastAccessAt ? new Date(a.lastAccessAt).getTime() : 0;
          bValue = b.lastAccessAt ? new Date(b.lastAccessAt).getTime() : 0;
          break;
        case 'streakDays':
          aValue = a.streakDays;
          bValue = b.streakDays;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      // Handle comparison
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [data, sortConfig]);

  // Toggle sort direction or change field
  const handleSort = useCallback((field: SortField) => {
    setSortConfig(prev => {
      if (prev.field === field) {
        // Toggle direction
        return {
          field,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      } else {
        // New field, default to ascending
        return {
          field,
          direction: 'asc',
        };
      }
    });
  }, []);

  // Set specific sort config
  const setSort = useCallback((field: SortField, direction: SortDirection) => {
    setSortConfig({ field, direction });
  }, []);

  return {
    sortedData,
    sortConfig,
    handleSort,
    setSort,
  };
}
