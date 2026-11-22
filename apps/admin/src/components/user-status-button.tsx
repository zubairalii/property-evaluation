'use client';

import { Button } from '@/components/ui/button';

export function UserStatusButton({
  status,
  disabled,
  onChange,
}: {
  status: 'active' | 'inactive';
  disabled?: boolean;
  onChange: (status: 'active' | 'inactive') => void;
}) {
  const next = status === 'active' ? 'inactive' : 'active';
  return (
    <Button
      variant={status === 'active' ? 'danger' : 'default'}
      disabled={disabled}
      onClick={() => onChange(next)}
    >
      {status === 'active' ? 'Deactivate' : 'Activate'}
    </Button>
  );
}
