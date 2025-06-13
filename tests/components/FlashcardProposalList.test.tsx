import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FlashcardProposalList from '@/components/generate/FlashcardProposalList';
import type { ProposalState } from '@/components/views/GenerateView';

const baseProposal = (id: string): ProposalState => ({
  id,
  original: { front: 'Q', back: 'A', source: 'ai-full' },
  current: { front: 'Q', back: 'A', source: 'ai-full' },
  isSelected: false,
  isEditing: false,
  isValid: true,
});

describe('<FlashcardProposalList /> derivations', () => {
  it('enables "Save All" when all proposals valid', () => {
    const proposals = [baseProposal('1'), baseProposal('2')];

    render(
      <FlashcardProposalList
        proposals={proposals}
        onUpdateProposal={vi.fn()}
        onToggleSelectProposal={vi.fn()}
        onToggleSelectAll={vi.fn()}
        onToggleEdit={vi.fn()}
        onSave={vi.fn()}
        onSaveAll={vi.fn()}
        isSaving={false}
      />
    );

    const saveAllBtn = screen.getByRole('button', { name: /save all/i });
    expect(saveAllBtn).toBeEnabled();
  });

  it('disables "Save All" when at least one proposal invalid', () => {
    const invalid = { ...baseProposal('3'), isValid: false } as ProposalState;
    const proposals = [baseProposal('1'), invalid];

    render(
      <FlashcardProposalList
        proposals={proposals}
        onUpdateProposal={vi.fn()}
        onToggleSelectProposal={vi.fn()}
        onToggleSelectAll={vi.fn()}
        onToggleEdit={vi.fn()}
        onSave={vi.fn()}
        onSaveAll={vi.fn()}
        isSaving={false}
      />
    );

    const saveAllBtn = screen.getByRole('button', { name: /save all/i });
    expect(saveAllBtn).toBeDisabled();
  });
});
