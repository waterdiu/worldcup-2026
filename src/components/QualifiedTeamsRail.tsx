interface QualifiedTeamsRailProps {
  teams: string[];
  label: string;
}

export function QualifiedTeamsRail({ teams, label }: QualifiedTeamsRailProps) {
  return (
    <div className="team-rail" aria-label={label}>
      {teams.map((team) => (
        <span key={team} className="team-rail__chip">
          {team}
        </span>
      ))}
    </div>
  );
}
