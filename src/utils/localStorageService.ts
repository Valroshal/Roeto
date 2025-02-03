export const getPlayerWins = (): number => {
    return Number(localStorage.getItem('player_wins')) || 0;
  };
  
  export const getAIWins = (): number => {
    return Number(localStorage.getItem('ai_wins')) || 0;
  };
  
  export const savePlayerWins = (wins: number): void => {
    localStorage.setItem('player_wins', wins.toString());
  };
  
  export const saveAIWins = (wins: number): void => {
    localStorage.setItem('ai_wins', wins.toString());
  };