// hooks/usePlayStats.js
import { usePersistentState } from "../lib/store";

const EMPTY = { seconds: 0, challengesDone: 0, best: {} };

export function usePlayStats() {
  const [stats, setStats] = usePersistentState("recovery-play-stats", EMPTY);

  const addTime = (seconds) => seconds > 0 && setStats((s) => ({ ...s, seconds: (s.seconds || 0) + Math.round(seconds) }));
  const completeChallenge = () => setStats((s) => ({ ...s, challengesDone: (s.challengesDone || 0) + 1 }));

  /** Records a score; returns true if it's a new best. `lowerIsBetter` for move counts. */
  const recordScore = (game, score, lowerIsBetter = false) => {
    let isBest = false;
    setStats((s) => {
      const prev = s.best?.[game];
      isBest = prev === undefined || (lowerIsBetter ? score < prev : score > prev);
      return isBest ? { ...s, best: { ...s.best, [game]: score } } : s;
    });
    return isBest;
  };

  /** Versus games: count wins. */
  const recordWin = (game) => setStats((s) => ({ ...s, wins: { ...s.wins, [game]: (s.wins?.[game] || 0) + 1 } }));

  return { stats, addTime, completeChallenge, recordScore, recordWin };
}
