import { useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { FlashcardProposal } from '@/types';
import {
  FLASHCARD_FRONT_MAX_LENGTH,
  FLASHCARD_BACK_MAX_LENGTH,
} from '@/lib/validators/flashcard.validator';

export interface ProposalState {
  id: string;
  original: FlashcardProposal;
  current: FlashcardProposal;
  isSelected: boolean;
  isEditing: boolean;
  isValid: boolean;
}

type ProposalsAction =
  | { type: 'INITIALIZE'; payload: FlashcardProposal[] }
  | {
      type: 'UPDATE_TEXT';
      payload: { id: string; newFront: string; newBack: string };
    }
  | { type: 'TOGGLE_SELECT'; payload: { id: string; isSelected: boolean } }
  | { type: 'TOGGLE_SELECT_ALL'; payload: { isSelected: boolean } }
  | { type: 'TOGGLE_EDIT'; payload: { id: string; isEditing: boolean } }
  | { type: 'RESET' };

const validateProposal = (proposal: FlashcardProposal): boolean => {
  return (
    proposal.front.length > 0 &&
    proposal.front.length <= FLASHCARD_FRONT_MAX_LENGTH &&
    proposal.back.length > 0 &&
    proposal.back.length <= FLASHCARD_BACK_MAX_LENGTH
  );
};

const proposalsReducer = (
  state: ProposalState[],
  action: ProposalsAction
): ProposalState[] => {
  switch (action.type) {
    case 'INITIALIZE':
      return action.payload.map((p) => ({
        id: uuidv4(),
        original: p,
        current: p,
        isSelected: false,
        isEditing: false,
        isValid: validateProposal(p),
      }));
    case 'UPDATE_TEXT':
      return state.map((p) =>
        p.id === action.payload.id
          ? {
              ...p,
              current: {
                front: action.payload.newFront,
                back: action.payload.newBack,
              },
              isValid: validateProposal({
                front: action.payload.newFront,
                back: action.payload.newBack,
              }),
            }
          : p
      );
    case 'TOGGLE_SELECT':
      return state.map((p) =>
        p.id === action.payload.id
          ? { ...p, isSelected: action.payload.isSelected }
          : p
      );
    case 'TOGGLE_SELECT_ALL':
      return state.map((p) => ({
        ...p,
        isSelected: action.payload.isSelected,
      }));
    case 'TOGGLE_EDIT':
      return state.map((p) =>
        p.id === action.payload.id
          ? { ...p, isEditing: action.payload.isEditing }
          : p
      );
    case 'RESET':
      return [];
    default:
      return state;
  }
};

export function useProposals() {
  const [proposals, dispatch] = useReducer(
    proposalsReducer,
    [] as ProposalState[]
  );

  const initialize = useCallback((payload: FlashcardProposal[]) => {
    dispatch({ type: 'INITIALIZE', payload });
  }, []);

  const updateText = useCallback(
    (id: string, newFront: string, newBack: string) => {
      dispatch({ type: 'UPDATE_TEXT', payload: { id, newFront, newBack } });
    },
    []
  );

  const toggleSelect = useCallback((id: string, isSelected: boolean) => {
    dispatch({ type: 'TOGGLE_SELECT', payload: { id, isSelected } });
  }, []);

  const toggleSelectAll = useCallback((isSelected: boolean) => {
    dispatch({ type: 'TOGGLE_SELECT_ALL', payload: { isSelected } });
  }, []);

  const toggleEdit = useCallback((id: string, isEditing: boolean) => {
    dispatch({ type: 'TOGGLE_EDIT', payload: { id, isEditing } });
  }, []);

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    proposals,
    initialize,
    updateText,
    toggleSelect,
    toggleSelectAll,
    toggleEdit,
    reset,
  } as const;
}
