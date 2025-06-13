import FlashcardProposalItem from './FlashcardProposalItem';
import type { ProposalState } from '@/lib/hooks/useProposals';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FlashcardProposalListProps {
  proposals: ProposalState[];
  // eslint-disable-next-line no-unused-vars
  onUpdateProposal: (id: string, newFront: string, newBack: string) => void;
  // eslint-disable-next-line no-unused-vars
  onToggleSelectProposal: (id: string, isSelected: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  onToggleSelectAll: (isSelected: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  onToggleEdit: (id: string, isEditing: boolean) => void;
  onSave: () => void;
  onSaveAll: () => void;
  isSaving: boolean;
}

const FlashcardProposalList = ({
  proposals,
  onUpdateProposal,
  onToggleSelectProposal,
  onToggleSelectAll,
  onToggleEdit,
  onSave,
  onSaveAll,
  isSaving,
}: FlashcardProposalListProps) => {
  const allSelected =
    proposals.length > 0 && proposals.every((p) => p.isSelected);
  const selectedCount = proposals.filter((p) => p.isSelected).length;
  const canSave =
    selectedCount > 0 && proposals.every((p) => !p.isSelected || p.isValid);

  const allValid = proposals.every((p) => p.isValid);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={(checked) => onToggleSelectAll(!!checked)}
            aria-label="Zaznacz wszystkie"
          />
          <Label htmlFor="select-all">
            Zaznacz wszystkie ({selectedCount} / {proposals.length})
          </Label>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={onSaveAll}
            disabled={!allValid || isSaving}
          >
            {isSaving ? 'Saving...' : `Save All (${proposals.length})`}
          </Button>
          <Button onClick={onSave} disabled={!canSave || isSaving}>
            {isSaving ? 'Saving...' : `Save Selected (${selectedCount})`}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {proposals.map((proposal) => (
          <FlashcardProposalItem
            key={proposal.id}
            proposal={proposal}
            onUpdate={onUpdateProposal}
            onToggleSelect={onToggleSelectProposal}
            onToggleEdit={onToggleEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default FlashcardProposalList;
