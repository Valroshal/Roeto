import React, { useCallback, useEffect, useState } from "react";
import { getPlayerWins, getAIWins, savePlayerWins, saveAIWins } from '../../utils/localStorageService';
import '../Game/Game.css';
import Dice from '../../components/Dice/Dice';
import Player from '../../components/Player/Player';

interface PlayerData {
    score: number;
    roundsWon: number;
    totalWins: number;
}

const Game: React.FC = () => {
    const [players, setPlayers] = useState<PlayerData[]>([
        { score: 0, roundsWon: 0, totalWins: 0 },
        { score: 0, roundsWon: 0, totalWins: 0 },
    ]);
    const [currentPlayer, setCurrentPlayer] = useState<number>(0);
    const [roundScore, setRoundScore] = useState<number>(0);
    const [winningScore, setWinningScore] = useState<number>(100);
    const [dice, setDice] = useState<[number, number]>([1, 1]);
    const [message, setMessage] = useState<string>('');
    const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [backgroundMusic, setBackgroundMusic] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio('/sounds/background-music.mp3');
        audio.loop = true;
        setBackgroundMusic(audio);
    }, []);

    useEffect(() => {
        const playerWins = getPlayerWins();
        const aiWins = getAIWins();
    
        setPlayers((prevPlayers) =>
            prevPlayers.map((player, index) =>
                index === 0 ? { ...player, totalWins: playerWins } : { ...player, totalWins: aiWins }
            )
        );
    }, []);

    const handleWin = useCallback((who: "player" | "ai"): void => {
        setPlayers((prevPlayers) => {
            return prevPlayers.map((player, index) => {
                if ((who === "player" && index === 0) || (who === "ai" && index === 1)) {
                    const newTotalWins = player.totalWins + 1;
    
                    if (who === "player") savePlayerWins(newTotalWins);
                    else saveAIWins(newTotalWins);
    
                    return { ...player, totalWins: newTotalWins };
                }
                return player;
            });
        });
    }, [setPlayers]);
    

    const toggleMusic = (): void => {
        if (!backgroundMusic) return;
    
        if (isMusicPlaying) {
          backgroundMusic.pause();
        } else {
          backgroundMusic.play().catch((error) => console.error('Autoplay prevented:', error));
        }
    
        setIsMusicPlaying(!isMusicPlaying);
    };

    const rollDice = (): [number, number] => {
        return [Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)];
    };

    const resetGame = (): void => {
        setPlayers((prevPlayers) =>
          prevPlayers.map((player) => ({
            score: 0,
            roundsWon: player.roundsWon,
            totalWins: player.totalWins,
          }))
        );
        setRoundScore(0);
        setCurrentPlayer(0);
        setGameOver(false);
        setDice([1, 1]);
        setMessage('')
    };

    const playSound = (soundFile: string): void => {
        const audio = new Audio(`/sounds/${soundFile}`);
        audio.play();
    };

    const finalizeAiTurn = useCallback((aiRoundScore: number) => {
        setPlayers((prevPlayers) => {
            const updatedPlayers = prevPlayers.map((player, index) =>
                index === 1 ? { ...player, score: player.score + aiRoundScore } : player
            );
    
            if (updatedPlayers[1].score >= winningScore) {
                setMessage("You Lose! AI Wins.");
                playSound('double-six.wav');
                setGameOver(true);
                handleWin('ai');
    
                return updatedPlayers.map((player, index) =>
                    index === 1 ? { ...player, roundsWon: player.roundsWon + 1, totalWins: player.totalWins + 1 } : player
                );
            }
    
            return updatedPlayers;
        });
    
        setRoundScore(0);
        setCurrentPlayer(0);
    }, [winningScore, setPlayers, setRoundScore, setMessage, setGameOver, handleWin]); 

    const aiTurn = useCallback(() => {
        if (gameOver) return;
    
        let aiRoundScore = 0;
    
        const rollAndPlay = () => {
            if (aiRoundScore >= 18 || gameOver) {
                finalizeAiTurn(aiRoundScore);
                return;
            }
    
            const newDice: [number, number] = rollDice();
            setDice(newDice);
    
            if (newDice[0] === 6 && newDice[1] === 6) {
                playSound('double-six.wav');
                setMessage("AI rolled a double six and lost 12 points!");
    
                setPlayers((prevPlayers) =>
                    prevPlayers.map((player, index) =>
                        index === 1 ? { ...player, score: Math.max(0, player.score - 12) } : player
                    )
                );
    
                setRoundScore(0);
                setCurrentPlayer(0);
                return;
            }
    
            aiRoundScore += newDice[0] + newDice[1];
    
            setTimeout(rollAndPlay, 1000);
        };
    
        rollAndPlay();
    }, [gameOver, setPlayers, setRoundScore, setDice, setMessage, setCurrentPlayer, finalizeAiTurn]);
    
    const switchPlayer = useCallback(() => {
        setCurrentPlayer(prev => {
          const nextPlayer = prev === 0 ? 1 : 0;
          if (!gameOver && nextPlayer === 1) {
            setTimeout(aiTurn, 1000);
          }
          return nextPlayer;
        });
    }, [gameOver, aiTurn]);

    const handleHold = (): void => {
        if (gameOver) return;
      
        setPlayers(prev => {
          const newPlayers = prev.map((p, i) => 
            i === currentPlayer ? {...p, score: p.score + roundScore} : p
          );
      
          if (newPlayers[0].score >= winningScore) {
            setMessage("You Win!");
            playSound('win-sound.wav');
            setGameOver(true);
            handleWin('player');
            return newPlayers.map(p => ({...p, roundsWon: p.roundsWon + (p === newPlayers[0] ? 1 : 0)}));
          }
      
          return newPlayers;
        });
      
        setRoundScore(0);
        
        // Only switch if game isn't over
        if (!gameOver && players[currentPlayer].score + roundScore < winningScore) {
          switchPlayer();
        }
      };

    const handleRollDice = useCallback(() => {
        if (gameOver) return;
      
        const newDice = rollDice();
        setDice(newDice);
        setMessage(`You rolled: ${newDice[0]} and ${newDice[1]}`);
        playSound('roll-dice.wav');
      
        setTimeout(() => {
          if (newDice[0] === 6 && newDice[1] === 6) {
            playSound('double-six.wav');
            setMessage('Double six! You lose your round score and 12 points!');
      
            setPlayers((prevPlayers) =>
              prevPlayers.map((player, index) =>
                index === currentPlayer
                  ? { ...player, score: Math.max(0, player.score - 12) }
                  : player
              )
            );
      
            setRoundScore(0);
            switchPlayer();
          } else {
            setRoundScore((prev) => prev + newDice[0] + newDice[1]);
          }

        }, 1500);
    }, [gameOver, currentPlayer, switchPlayer, roundScore]);

    return(
        <div className="game-container">
            <button className="music-button" onClick={toggleMusic}>
                {isMusicPlaying ? 'Mute Music' : 'Play Music'}
            </button>

            <h1> Dice Game </h1>
            <div className="players">
                <Player player={0} {...players[0]} isActive={currentPlayer === 0} />
                <Player player={1} {...players[1]} isActive={currentPlayer === 1} />
            </div>

            <div className="dice-container">
                <Dice dice={dice} />
            </div>

            {message && <div className="message-container"> 
                <p>{message}</p>
            </div>}

            <button className="roll-button" onClick={handleRollDice} disabled={currentPlayer === 1 || gameOver}>
                Roll Dice
            </button>
            <button className="hold-button" onClick={handleHold} disabled={currentPlayer === 1 || gameOver}>
                Hold
            </button>
            <button className="new-game-button" onClick={resetGame}>
                New Game
            </button>

            <div>
                <p>Winning Score: </p>
                <input
                    type="number"
                    value={winningScore}
                    onChange={(e) => setWinningScore(Number(e.target.value))}
                />
            </div>
        </div>
    )
};

export default Game;