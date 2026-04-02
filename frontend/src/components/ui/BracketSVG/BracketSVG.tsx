const TEAM_W = 180;
const TEAM_H = 28;
const TEAM_GAP = 6;
const MATCH_H = TEAM_H * 2 + TEAM_GAP;
const COL_GAP = 60;
const ROW_GAP = 32;

function quartsY(): number[] {
  return [0, 1, 2, 3].map((i) => i * (MATCH_H + ROW_GAP) + MATCH_H / 2);
}

function demisY(): number[] {
  const q = quartsY();
  return [(q[0] + q[1]) / 2, (q[2] + q[3]) / 2];
}

function finaleY(): number {
  const d = demisY();
  return (d[0] + d[1]) / 2;
}

const svgH = 4 * MATCH_H + 3 * ROW_GAP;
const col0X = 0;
const col1X = col0X + TEAM_W + COL_GAP;
const col2X = col1X + TEAM_W + COL_GAP;
const svgW = col2X + TEAM_W;

function MatchBox({
  x,
  y,
  topWinner,
}: {
  x: number;
  y: number;
  topWinner?: boolean;
  label?: string;
}) {
  const topColor = topWinner ? '#27ae60' : '#e74c3c';
  const botColor = topWinner ? '#e74c3c' : '#27ae60';
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={TEAM_W}
        height={TEAM_H}
        fill="#1a2744"
        stroke={topColor}
        strokeWidth={2}
        rx={3}
      />
      <text x={x + 8} y={y + TEAM_H / 2 + 5} fill="#fff" fontSize={12}>
        Nom équipe
      </text>
      <text
        x={x + TEAM_W - 8}
        y={y + TEAM_H / 2 + 5}
        fill="#fff"
        fontSize={12}
        textAnchor="end"
      >
        score
      </text>
      <rect
        x={x}
        y={y + TEAM_H + TEAM_GAP}
        width={TEAM_W}
        height={TEAM_H}
        fill="#1a2744"
        stroke={botColor}
        strokeWidth={2}
        rx={3}
      />
      <text
        x={x + 8}
        y={y + TEAM_H + TEAM_GAP + TEAM_H / 2 + 5}
        fill="#fff"
        fontSize={12}
      >
        Nom équipe
      </text>
      <text
        x={x + TEAM_W - 8}
        y={y + TEAM_H + TEAM_GAP + TEAM_H / 2 + 5}
        fill="#fff"
        fontSize={12}
        textAnchor="end"
      >
        score
      </text>
    </g>
  );
}

const BracketSVG = () => {
  const qCY = quartsY();
  const dCY = demisY();
  const fCY = finaleY();
  const qBoxY = qCY.map((cy) => cy - MATCH_H / 2);
  const dBoxY = dCY.map((cy) => cy - MATCH_H / 2);
  const fBoxY = fCY - MATCH_H / 2;
  const connectorQD = [
    { q0: 0, q1: 1, d: 0 },
    { q0: 2, q1: 3, d: 1 },
  ];

  return (
    <svg width={svgW} height={svgH} style={{ overflow: 'visible' }}>
      {qBoxY.map((y, i) => (
        <MatchBox key={i} x={col0X} y={y} topWinner={true} />
      ))}
      {connectorQD.map(({ q0, q1, d }) => {
        const midX = col0X + TEAM_W + COL_GAP / 2;
        return (
          <g key={d} stroke="#fff" strokeWidth={2} fill="none">
            <line x1={col0X + TEAM_W} y1={qCY[q0]} x2={midX} y2={qCY[q0]} />
            <line x1={col0X + TEAM_W} y1={qCY[q1]} x2={midX} y2={qCY[q1]} />
            <line x1={midX} y1={qCY[q0]} x2={midX} y2={qCY[q1]} />
            <line x1={midX} y1={dCY[d]} x2={col1X} y2={dCY[d]} />
          </g>
        );
      })}
      {dBoxY.map((y, i) => (
        <MatchBox key={i} x={col1X} y={y} topWinner={true} />
      ))}
      <g stroke="#fff" strokeWidth={2} fill="none">
        <line
          x1={col1X + TEAM_W}
          y1={dCY[0]}
          x2={col1X + TEAM_W + COL_GAP / 2}
          y2={dCY[0]}
        />
        <line
          x1={col1X + TEAM_W}
          y1={dCY[1]}
          x2={col1X + TEAM_W + COL_GAP / 2}
          y2={dCY[1]}
        />
        <line
          x1={col1X + TEAM_W + COL_GAP / 2}
          y1={dCY[0]}
          x2={col1X + TEAM_W + COL_GAP / 2}
          y2={dCY[1]}
        />
        <line x1={col1X + TEAM_W + COL_GAP / 2} y1={fCY} x2={col2X} y2={fCY} />
      </g>
      <MatchBox x={col2X} y={fBoxY} topWinner={true} />
    </svg>
  );
};

export default BracketSVG;
