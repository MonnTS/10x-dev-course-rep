import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import type { ProposalState } from '@/components/views/GenerateView';
import { Button } from '@/components/ui/button';
import { Label } from '@radix-ui/react-label';

interface FlashcardProposalItemProps {
  proposal: ProposalState;
  // eslint-disable-next-line no-unused-vars
  onUpdate: (id: string, newFront: string, newBack: string) => void;
  // eslint-disable-next-line no-unused-vars
  onToggleSelect: (id: string, isSelected: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  onToggleEdit: (id: string, isEditing: boolean) => void;
}

const FRONT_MAX_LENGTH = 200;
const BACK_MAX_LENGTH = 500;

const FlashcardProposalItem = ({
  proposal,
  onUpdate,
  onToggleSelect,
  onToggleEdit,
}: FlashcardProposalItemProps) => {
  const isFrontInvalid =
    proposal.current.front.length > FRONT_MAX_LENGTH ||
    proposal.current.front.length === 0;
  const isBackInvalid =
    proposal.current.back.length > BACK_MAX_LENGTH ||
    proposal.current.back.length === 0;

  return (
    <Card className={!proposal.isValid ? 'border-destructive' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Label
            htmlFor={`checkbox-${proposal.id}`}
            className="font-normal leading-none"
          >
            Zaznacz fiszkę do zapisu
          </Label>
          <Checkbox
            id={`checkbox-${proposal.id}`}
            aria-label="Zaznacz fiszkę do zapisu"
            checked={proposal.isSelected}
            onCheckedChange={(checked) =>
              onToggleSelect(proposal.id, !!checked)
            }
            className="mr-2"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleEdit(proposal.id, !proposal.isEditing)}
        >
          {proposal.isEditing ? 'Done' : 'Edit'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-1.5">
          <Textarea
            id={`front-${proposal.id}`}
            value={proposal.current.front}
            onChange={(e) =>
              onUpdate(proposal.id, e.target.value, proposal.current.back)
            }
            maxLength={FRONT_MAX_LENGTH}
            disabled={!proposal.isEditing}
            placeholder="Question / Concept"
            aria-label="Question"
            rows={2}
            className={`resize-none ${isFrontInvalid ? 'border-destructive' : ''}`}
          />
          <p
            className={`text-sm text-right ${isFrontInvalid ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            {proposal.current.front.length} / {FRONT_MAX_LENGTH}
          </p>
        </div>
        <div className="grid gap-1.5">
          <Textarea
            id={`back-${proposal.id}`}
            value={proposal.current.back}
            onChange={(e) =>
              onUpdate(proposal.id, proposal.current.front, e.target.value)
            }
            maxLength={BACK_MAX_LENGTH}
            disabled={!proposal.isEditing}
            className={`min-h-[100px] ${isBackInvalid ? 'border-destructive' : ''}`}
          />
          <p
            className={`text-sm text-right ${isBackInvalid ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            {proposal.current.back.length} / {BACK_MAX_LENGTH}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardProposalItem;
