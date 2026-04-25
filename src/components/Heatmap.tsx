interface HeatmapProps {
  weeks?: number;
  levels?: number[]; // 0..4 por día, length = weeks*7. Si no se pasa, se genera pseudoaleatorio.
}

export function Heatmap({ weeks = 14, levels }: HeatmapProps) {
  const cells: number[] =
    levels ??
    Array.from({ length: weeks * 7 }, (_, i) => {
      const seed = Math.sin(i * 9301 + 49297) * 233280;
      const n = seed - Math.floor(seed);
      if (n < 0.15) return 0;
      if (n < 0.35) return 1;
      if (n < 0.6) return 2;
      if (n < 0.85) return 3;
      return 4;
    });
  return (
    <div
      className="grid grid-flow-col gap-1"
      style={{ gridTemplateRows: 'repeat(7, minmax(0,1fr))' }}
    >
      {cells.map((lvl, i) => (
        <div key={i} className={`w-3 h-3 rounded-sm heat-${lvl}`} />
      ))}
    </div>
  );
}
