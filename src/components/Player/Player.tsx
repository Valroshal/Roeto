import React from 'react';

type PlayerProps = {
    player: number;
    score: number;
    roundsWon: number;
    isActive: boolean;
    totalWins: number;
  };
  
  const Player: React.FC<PlayerProps> = ({ player, score, roundsWon, isActive, totalWins }) => {
    return (
      <div style={{ fontWeight: isActive ? 'bold' : 'normal' }}>
        <h3>Player {player + 1}</h3>
        <p>Score: {score}</p>
        <p>Rounds Won: {roundsWon}</p>
        <p>Total Wins: {totalWins}</p>
      </div>
    );
  };
  
  export default Player;