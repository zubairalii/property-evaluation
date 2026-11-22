import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { emptyPropertyForm, type PropertyFormValues } from '@/lib/validation/property';

interface DraftContextValue {
  draft: PropertyFormValues;
  setDraft: (values: PropertyFormValues) => void;
  clearDraft: () => void;
}

const DraftContext = createContext<DraftContextValue | null>(null);

export function DraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<PropertyFormValues>(emptyPropertyForm);
  const value = useMemo(
    () => ({
      draft,
      setDraft,
      clearDraft: () => setDraft(emptyPropertyForm),
    }),
    [draft],
  );
  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useDraft(): DraftContextValue {
  const value = useContext(DraftContext);
  if (!value) throw new Error('useDraft must be used within DraftProvider');
  return value;
}
