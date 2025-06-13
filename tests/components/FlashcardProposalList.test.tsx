import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FlashcardProposalList from '@/components/generate/FlashcardProposalList';
import type { ProposalState } from '@/lib/hooks/useProposals';

const baseProposal = (id: string): ProposalState => ({
  id,
  original: { front: 'Q', back: 'A', source: 'ai-full' },
  current: { front: 'Q', back: 'A', source: 'ai-full' },
  isSelected: false,
  isEditing: false,
  isValid: true,
});

describe('<FlashcardProposalList /> derivations', () => {
  it('enables "Select all" checkbox when all proposals are valid', () => {
    const proposals = [baseProposal('1'), baseProposal('2')];

    render(
      <FlashcardProposalList
        proposals={proposals}
        selectedCount={0}
        onToggleSelectAll={vi.fn()}
        onToggleSelect={vi.fn()}
        onToggleEdit={vi.fn()}
        onUpdate={vi.fn()}
      />
    );

    const selectAllCheckbox = screen.getByRole('checkbox', {
      name: /select all/i,
    });
    expect(selectAllCheckbox).toBeEnabled();
  });

  it('shows correct selection count in label', () => {
    const proposals = [baseProposal('1'), baseProposal('2')];

    render(
      <FlashcardProposalList
        proposals={proposals}
        selectedCount={1}
        onToggleSelectAll={vi.fn()}
        onToggleSelect={vi.fn()}
        onToggleEdit={vi.fn()}
        onUpdate={vi.fn()}
      />
    );

    const label = screen.getByText(/select all \(1 \/ 2\)/i);
    expect(label).toBeInTheDocument();
  });
});
