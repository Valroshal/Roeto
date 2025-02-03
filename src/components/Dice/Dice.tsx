import React from 'react';

type DiceProps = {
    dice: [number, number];
  };
  
  const Dice: React.FC<DiceProps> = ({ dice }) => {
    return (
      <div>
        <p>Dice 1: {dice[0]}</p>
        <p>Dice 2: {dice[1]}</p>
      </div>
    );
  };
  
  export default Dice;