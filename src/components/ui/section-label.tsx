interface SectionLabelProps {
  label: string;
}

export function SectionLabel({ label }: SectionLabelProps) {
  return (
    <div className="border-b border-border-default pb-2 mb-3">
      <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-text-placeholder">
        {label}
      </span>
    </div>
  );
}
