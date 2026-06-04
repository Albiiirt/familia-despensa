import type { ItemStatus } from '../types';
import { STATUS_CONFIG } from '../lib/constants';

interface Props {
  status: ItemStatus;
  small?: boolean;
}

export function StatusBadge({ status, small }: Props) {
  const cfg = STATUS_CONFIG[status];
  if (small) {
    return (
      <span
        className="inline-block rounded-full"
        style={{ width: 8, height: 8, background: cfg.dot, flexShrink: 0 }}
      />
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="rounded-full" style={{ width: 6, height: 6, background: cfg.dot, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
}
