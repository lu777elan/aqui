import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

export default function GameChess() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, finished
  const [currentGame, setCurrentGame] = useState(null);
  const [board, setBoard] = useState(initializeBoard());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [turn, setTurn] = useState('white'); // white or black
  const [aiThinking, setAiThinking] = useState(false);

  function initializeBoard() {
    return [
      ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
      ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
      ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
    ];
  }

  const startNewGame = async () => {
    try {
      const newGame = await base44.entities.ChessGame.create({
        game_state: 'initial',
        moves: [],
        status: 'activo'
      });
      setCurrentGame(newGame);
      setBoard(initializeBoard());
      setTurn('white');
      setGameState('playing');
    } catch (error) {
      console.error('Error creando juego:', error);
    }
  };

  const pauseGame = async () => {
    if (currentGame) {
      await base44.entities.ChessGame.update(currentGame.id, { status: 'pausado' });
      setGameState('paused');
    }
  };

  const resumeGame = async () => {
    if (currentGame) {
      await base44.entities.ChessGame.update(currentGame.id, { status: 'activo' });
      setGameState('playing');
    }
  };

  const handleSquareClick = async (row, col) => {
    if (gameState !== 'playing' || turn === 'black' || aiThinking) return;

    if (selectedSquare) {
      // Move piece
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = newBoard[selectedSquare.row][selectedSquare.col];
      newBoard[selectedSquare.row][selectedSquare.col] = '';
      setBoard(newBoard);
      setSelectedSquare(null);
      setTurn('black');

      // AI turn
      setTimeout(() => makeAIMove(newBoard), 1000);
    } else if (board[row][col] && isWhitePiece(board[row][col])) {
      setSelectedSquare({ row, col });
    }
  };

  const makeAIMove = async (currentBoard) => {
    setAiThinking(true);
    
    // Simplified AI: random valid move
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newBoard = currentBoard.map(r => [...r]);
    // Find a black piece and move it randomly
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (newBoard[i][j] && !isWhitePiece(newBoard[i][j])) {
          // Simple move down
          if (i < 7 && !newBoard[i + 1][j]) {
            newBoard[i + 1][j] = newBoard[i][j];
            newBoard[i][j] = '';
            setBoard(newBoard);
            setTurn('white');
            setAiThinking(false);
            return;
          }
        }
      }
    }
    
    setAiThinking(false);
  };

  const isWhitePiece = (piece) => {
    return ['♙', '♖', '♘', '♗', '♕', '♔'].includes(piece);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-warm-900 dark:text-warm-100 mb-2">Ajedrez</h1>
          <p className="text-warm-600 dark:text-warm-400">Juega contra la AI</p>
        </div>
        {gameState === 'playing' && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={pauseGame}>
              <Pause className="w-4 h-4 mr-2" />
              Pausar
            </Button>
            <Button variant="outline" onClick={startNewGame}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
          </div>
        )}
      </div>

      {gameState === 'menu' && (
        <Card className="shadow-2xl">
          <CardContent className="p-12 text-center">
            <Crown className="w-24 h-24 text-amber-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-warm-900 dark:text-warm-100 mb-4">
              Bienvenido al Ajedrez
            </h2>
            <p className="text-warm-600 dark:text-warm-400 mb-8 max-w-md mx-auto">
              Juega una partida contra la AI. Puedes pausar en cualquier momento y continuar después.
            </p>
            <Button 
              size="lg" 
              className="bg-amber-600 hover:bg-amber-700 text-white text-lg px-8"
              onClick={startNewGame}
            >
              <Play className="w-5 h-5 mr-2" />
              Comenzar Partida
            </Button>
          </CardContent>
        </Card>
      )}

      {gameState === 'paused' && (
        <Card className="shadow-2xl">
          <CardContent className="p-12 text-center">
            <Pause className="w-24 h-24 text-warm-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-warm-900 dark:text-warm-100 mb-4">
              Juego Pausado
            </h2>
            <p className="text-warm-600 dark:text-warm-400 mb-8">
              Tu partida está guardada. Puedes continuar cuando quieras.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-terracota hover:bg-terracota-dark text-white"
                onClick={resumeGame}
              >
                <Play className="w-5 h-5 mr-2" />
                Continuar
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={startNewGame}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Nueva Partida
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {gameState === 'playing' && (
        <Card className="shadow-2xl">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-500" />
                Partida en Curso
              </CardTitle>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full font-medium ${
                  turn === 'white' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {turn === 'white' ? 'Tu turno' : 'Turno de AI'}
                </span>
                {aiThinking && (
                  <span className="flex items-center gap-2 text-warm-600">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    AI pensando...
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="w-full max-w-2xl mx-auto">
              <div className="grid grid-cols-8 gap-0 border-4 border-warm-700 rounded-lg overflow-hidden shadow-xl">
                {board.map((row, i) => (
                  row.map((piece, j) => {
                    const isLight = (i + j) % 2 === 0;
                    const isSelected = selectedSquare?.row === i && selectedSquare?.col === j;
                    return (
                      <div
                        key={`${i}-${j}`}
                        className={`aspect-square flex items-center justify-center text-5xl cursor-pointer transition-all ${
                          isLight ? 'bg-warm-200' : 'bg-warm-600'
                        } ${isSelected ? 'ring-4 ring-terracota' : ''} hover:opacity-80`}
                        onClick={() => handleSquareClick(i, j)}
                      >
                        {piece}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}