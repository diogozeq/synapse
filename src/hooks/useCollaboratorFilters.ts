import { useState, useMemo, useCallback } from 'react';
import {
  Collaborator,
  CollaboratorFilters,
  CollaboratorWithStats,
  CollaboratorStatus,
  Team,
  Role
} from '../types';

const DEFAULT_FILTERS: CollaboratorFilters = {
  search: '',
  status: [],
  teamIds: [],
  roleIds: [],
  xpRange: [0, 100000],
  completionRateRange: [0, 100],
  levels: [],
  minStreak: 0,
};

interface UseCollaboratorFiltersProps {
  collaborators: Collaborator[];
  teams: Team[];
  roles: Role[];
}

export function useCollaboratorFilters({
  collaborators,
  teams,
  roles
}: UseCollaboratorFiltersProps) {
  const [filters, setFilters] = useState<CollaboratorFilters>(DEFAULT_FILTERS);

  // Enrich collaborators with additional computed data
  const enrichedCollaborators = useMemo<CollaboratorWithStats[]>(() => {
    return collaborators.map(collab => {
      const completionRate = collab.coursesAssigned > 0
        ? (collab.coursesCompleted / collab.coursesAssigned) * 100
        : 0;

      const team = teams.find(t => t.id === collab.teamId);
      const roleObj = roles.find(r => r.name === collab.role);

      return {
        ...collab,
        team,
        roleObj,
        completionRate,
        avgScore: 0, // Will be calculated from enrollments if needed
        lastAccessAt: undefined, // Will come from enrollment data
      };
    });
  }, [collaborators, teams, roles]);

  // Apply filters
  const filteredCollaborators = useMemo(() => {
    let result = enrichedCollaborators;

    // Text search (name or email)
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(collab =>
        collab.name.toLowerCase().includes(searchLower) ||
        collab.email.toLowerCase().includes(searchLower)
      );
    }

    // Status filters
    if (filters.status.length > 0 && !filters.status.includes('all')) {
      result = result.filter(collab => {
        const hasStatus = filters.status.some(status => {
          switch (status) {
            case 'on-track':
              return collab.coursesLate === 0;
            case 'late':
              return collab.coursesLate > 0 && collab.coursesLate <= 3;
            case 'critical':
              return collab.coursesLate > 3;
            case 'inactive':
              return collab.streakDays === 0;
            default:
              return true;
          }
        });
        return hasStatus;
      });
    }

    // Team filters
    if (filters.teamIds.length > 0) {
      result = result.filter(collab => filters.teamIds.includes(collab.teamId));
    }

    // Role filters
    if (filters.roleIds.length > 0) {
      result = result.filter(collab =>
        collab.roleObj && filters.roleIds.includes(collab.roleObj.id)
      );
    }

    // XP range
    const [minXP, maxXP] = filters.xpRange;
    result = result.filter(collab =>
      collab.totalXP >= minXP && collab.totalXP <= maxXP
    );

    // Completion rate range
    const [minRate, maxRate] = filters.completionRateRange;
    result = result.filter(collab =>
      collab.completionRate >= minRate && collab.completionRate <= maxRate
    );

    // Level filters
    if (filters.levels.length > 0) {
      result = result.filter(collab => filters.levels.includes(collab.level));
    }

    // Min streak
    if (filters.minStreak > 0) {
      result = result.filter(collab => collab.streakDays >= filters.minStreak);
    }

    return result;
  }, [enrichedCollaborators, filters]);

  // Update individual filter
  const updateFilter = useCallback(<K extends keyof CollaboratorFilters>(
    key: K,
    value: CollaboratorFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Bulk update filters
  const updateFilters = useCallback((newFilters: Partial<CollaboratorFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.status.length > 0 ||
      filters.teamIds.length > 0 ||
      filters.roleIds.length > 0 ||
      filters.xpRange[0] !== 0 || filters.xpRange[1] !== 100000 ||
      filters.completionRateRange[0] !== 0 || filters.completionRateRange[1] !== 100 ||
      filters.levels.length > 0 ||
      filters.minStreak > 0
    );
  }, [filters]);

  // Quick filter presets
  const applyQuickFilter = useCallback((filterType: string) => {
    switch (filterType) {
      case 'top-performers':
        updateFilters({
          completionRateRange: [80, 100],
          status: [],
        });
        break;
      case 'needs-attention':
        updateFilters({
          status: ['late', 'critical'],
        });
        break;
      case 'newbies':
        updateFilters({
          levels: [1, 2, 3],
        });
        break;
      case 'veterans':
        updateFilters({
          levels: [7, 8, 9, 10],
        });
        break;
      case 'high-streak':
        updateFilters({
          minStreak: 7,
        });
        break;
      default:
        break;
    }
  }, [updateFilters]);

  return {
    filters,
    filteredCollaborators,
    updateFilter,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    applyQuickFilter,
    totalCount: enrichedCollaborators.length,
    filteredCount: filteredCollaborators.length,
  };
}
