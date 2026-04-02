import { Badge, type BadgeProps } from '@/components/ui/badge'
import { MATCH_STATUS_LABELS, type MatchStatus } from '@/lib/types'

const STATUS_VARIANT: Record<MatchStatus, BadgeProps['variant']> = {
  draft:     'secondary',
  uploaded:  'outline',
  reviewing: 'default',
  completed: 'default',
}

interface MatchStatusBadgeProps {
  status: MatchStatus
}

export function MatchStatusBadge({ status }: MatchStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {MATCH_STATUS_LABELS[status]}
    </Badge>
  )
}
