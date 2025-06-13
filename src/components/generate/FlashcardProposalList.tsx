import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { ProposalState } from '@/lib/hooks/useProposals';
import FlashcardProposalItem from './FlashcardProposalItem';

interface FlashcardProposalListProps {
  proposals: ProposalState[];
  selectedCount: number;
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelect: (id: string, isSelected: boolean) => void;
  onToggleEdit: (id: string, isEditing: boolean) => void;
  onUpdate: (id: string, newFront: string, newBack: string) => void;
}

const FlashcardProposalList = ({
  proposals,
  selectedCount,
  onToggleSelectAll,
  onToggleSelect,
  onToggleEdit,
  onUpdate,
}: FlashcardProposalListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Checkbox
          id="select-all"
          aria-label="Select all"
          checked={selectedCount > 0}
          onCheckedChange={onToggleSelectAll}
        />
        <Label htmlFor="select-all" className="text-sm text-muted-foreground">
          Select all ({selectedCount} / {proposals.length})
        </Label>
      </div>

      {proposals.map((proposal) => (
        <FlashcardProposalItem
          key={proposal.id}
          proposal={proposal}
          onUpdate={onUpdate}
          onToggleSelect={onToggleSelect}
          onToggleEdit={onToggleEdit}
        />
      ))}
    </div>
  );
};

export default FlashcardProposalList;
