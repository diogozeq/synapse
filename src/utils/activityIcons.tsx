/**
 * Activity Icon Mapping
 * Maps each ActivityType to its most intuitive Lucide icon
 */

import {
  BookOpen,
  Brain,
  CheckCircle,
  Edit3,
  Target,
  MessageSquare,
  GitBranch,
  Columns,
  Award,
  Layers
} from 'lucide-react';
import { ActivityType } from '../types';

export function getActivityIcon(type: ActivityType) {
  switch (type) {
    case ActivityType.SUMMARY:
      return BookOpen; // Open book for reading/summary
    case ActivityType.FLASHCARD:
      return Brain; // Brain for active recall
    case ActivityType.QUIZ:
      return CheckCircle; // Checkmark for quiz/test
    case ActivityType.CLOZE:
      return Edit3; // Edit/fill-in-the-blank
    case ActivityType.CASE_STUDY:
      return Target; // Target for case-based decisions
    case ActivityType.SELF_EXPLANATION:
      return MessageSquare; // Speech bubble for explanation
    case ActivityType.MAP_MENTAL:
      return GitBranch; // Branch/tree for mind map
    case ActivityType.COMPARISON:
      return Columns; // Columns for comparison table
    case ActivityType.SIMULATION:
      return Award; // Trophy/award for final simulation

    default:
      return BookOpen; // Default fallback
  }
}

/**
 * Get color theme for activity type
 */
export function getActivityColor(type: ActivityType): {
  bg: string;
  text: string;
  border: string;
  darkBg: string;
  darkText: string;
  darkBorder: string;
} {
  switch (type) {
    case ActivityType.SUMMARY:
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-300',
        darkBg: 'dark:bg-blue-950',
        darkText: 'dark:text-blue-400',
        darkBorder: 'dark:border-blue-700'
      };
    case ActivityType.FLASHCARD:
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-300',
        darkBg: 'dark:bg-purple-950',
        darkText: 'dark:text-purple-400',
        darkBorder: 'dark:border-purple-700'
      };
    case ActivityType.QUIZ:
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-300',
        darkBg: 'dark:bg-green-950',
        darkText: 'dark:text-green-400',
        darkBorder: 'dark:border-green-700'
      };
    case ActivityType.CLOZE:
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-300',
        darkBg: 'dark:bg-yellow-950',
        darkText: 'dark:text-yellow-400',
        darkBorder: 'dark:border-yellow-700'
      };
    case ActivityType.CASE_STUDY:
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-300',
        darkBg: 'dark:bg-red-950',
        darkText: 'dark:text-red-400',
        darkBorder: 'dark:border-red-700'
      };
    case ActivityType.SELF_EXPLANATION:
      return {
        bg: 'bg-pink-100',
        text: 'text-pink-700',
        border: 'border-pink-300',
        darkBg: 'dark:bg-pink-950',
        darkText: 'dark:text-pink-400',
        darkBorder: 'dark:border-pink-700'
      };
    case ActivityType.MAP_MENTAL:
      return {
        bg: 'bg-indigo-100',
        text: 'text-indigo-700',
        border: 'border-indigo-300',
        darkBg: 'dark:bg-indigo-950',
        darkText: 'dark:text-indigo-400',
        darkBorder: 'dark:border-indigo-700'
      };
    case ActivityType.COMPARISON:
      return {
        bg: 'bg-teal-100',
        text: 'text-teal-700',
        border: 'border-teal-300',
        darkBg: 'dark:bg-teal-950',
        darkText: 'dark:text-teal-400',
        darkBorder: 'dark:border-teal-700'
      };
    case ActivityType.SIMULATION:
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-300',
        darkBg: 'dark:bg-amber-950',
        darkText: 'dark:text-amber-400',
        darkBorder: 'dark:border-amber-700'
      };

    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
        darkBg: 'dark:bg-gray-800',
        darkText: 'dark:text-gray-400',
        darkBorder: 'dark:border-gray-600'
      };
  }
}
