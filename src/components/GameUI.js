import React, { useState, useRef, useEffect } from 'react';
import './CambioUI.css';
import { useParams, useNavigate } from 'react-router-dom';
import Card from './Card';

const GameUI = ({ username, roomName, roomUUID, playerHands, flippedCards, discardPile, host, onBurn, onEndGame, onCallCambio, GameLog, gameState, selected, setSelected, drawnCard, onSwap, onNotSwap, FinishedBurning, giveBurn, CambioCalled,doDraw, waitDraw,CambioCaller,burnReceiver }) => {
  const logEndRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [GameLog]);


  const cardComponents = Array.from({ length: 52 }, (_, index) => (
    <Card
      key={index + 1} // Ensure a unique key for each component
      number={index + 1}
      discard={discardPile}
      currentPlayer={username}
      playerDecks={playerHands}
      selected={selected}
      setSelected={setSelected}
      flippedCards={flippedCards}
      drawnCard={drawnCard}
      gameState={gameState}
      giveBurn={giveBurn}
      CambioCaller={CambioCaller}
    />
  ));


  const playernum = (player) => {
    if (player.id === username) {
      return 0;
    }
    return playerHands.indexOf(player) - (playerHands.indexOf(playerHands.find(player => player.id === username)) < playerHands.indexOf(player) ? 1 : 0) - (playerHands.length - 2) / 2.0;
  }

  return (
    <div className="game-container">
      {/* Top Bar */}
      <div className="top-bar">
        <span>Signed in as: {username}</span>
        <span>{roomName} ({roomUUID})</span>
        <button style={{ color: 'black' }} onClick={() => navigate('/')}>Return to Lobby</button>
      </div>

      <div style={{ color: '#1a1a1d' }}>
        <h1>Cambio Online</h1>
      </div>

      <div className="main-game">
        <div className="game-log">
          <div>{waitDraw ? ('Draw a card.') : gameState === 'draw' ? 'Replace or Discard.' : gameState === 'peekSelf' ? 'Look at your own card.' : gameState === 'peekOther' ? 'Look at another player\'s card.' : gameState === 'swap' ? 'Swap two cards.' : gameState === 'lookSwap' ? 'Look at two cards and choose to swap.' : gameState === 'burn' ? (giveBurn ? `Give a card to ${burnReceiver}.` : 'Burn cards.') : gameState === 'locked' ? 'Waiting...' : ''}</div>
          <div className="log-messages">
            {GameLog && GameLog.length > 0
              ? GameLog.map((message, index) => (
                <p
                  key={index}
                  style={{
                    color: message.toLowerCase() === 'new game started.'
                        ? '#4caf50'
                        : message.toLowerCase() === 'game ended by host.'
                        ? 'red'
                        : message.toLowerCase().includes('won the game!')
                        ? 'red'
                        : message.toLowerCase().includes('called cambio!')
                        ? '#4caf50'
                        : message.toLowerCase().includes('failed to burn')
                        ? 'orange'
                        : 'inherit',
                }}
                >
                  {message}
                </p>
              ))
              : <p>Moves will appear here...</p>
            }
            <div ref={logEndRef} />
          </div>
          <button style={{textDecoration: CambioCalled ? 'line-through' : 'none', cursor: (CambioCalled || !waitDraw) ? 'not-allowed' : 'pointer'}} onClick={onCallCambio}>Call Cambio</button>
        </div>

        {playerHands.map((player) => (
          ((player.id === username) ? <div style={{ position: 'absolute', left: window.innerWidth / 2000 * (1370), top: window.innerHeight / 2000 * 1025, textAlign: 'center', transform: 'translate(-50%, -50%)' }}>Your Cards</div> : <div style={{ position: 'absolute', left: window.innerWidth / 2000 * (1000 + 370 * playernum(player)), top: window.innerHeight / 2000 * 650, textAlign: 'center', transform: 'translate(-50%, -50%)' }}>{player.id}{!FinishedBurning[playerHands.indexOf(player)] ? ' (burning...)' : ''}</div>)
        ))}

        <div style={{ position: 'absolute', left: window.innerWidth / 2000 * (950), top: window.innerHeight / 2000 * 1075, textAlign: 'center', transform: 'translate(-50%, -50%)' }}>Draw</div>
        <div style={{ position: 'absolute', left: window.innerWidth / 2000 * (1050), top: window.innerHeight / 2000 * 1075, textAlign: 'center', transform: 'translate(-50%, -50%)' }}>Discard</div>

        {((gameState === 'burn' && !giveBurn) && !FinishedBurning[playerHands.indexOf(playerHands.find(player => player.id === username))]) && <button style={{ position: 'absolute', left: window.innerWidth / 2000 * (1000), top: window.innerHeight / 2000 * 1300, textAlign: 'center', transform: 'translate(-50%, -50%)' }} onClick={onBurn}>Done Burning</button>}

        {(gameState === 'lookSwap' && selected.length === 2) && <button style={{ position: 'absolute', left: window.innerWidth / 2000 * (1000), top: window.innerHeight / 2000 * 1200, textAlign: 'center', transform: 'translate(-50%, -50%)' }} onClick={onSwap}>Swap</button>}
        {(gameState === 'lookSwap' && selected.length === 2) && <button style={{ position: 'absolute', left: window.innerWidth / 2000 * (1000), top: window.innerHeight / 2000 * 1350, textAlign: 'center', transform: 'translate(-50%, -50%)' }} onClick={onNotSwap}>Don't Swap</button>}

        {username === host && <button style={{ backgroundColor: 'red', position: 'absolute', left: window.innerWidth / 2000 * (1000), top: window.innerHeight / 2000 * 1500, textAlign: 'center', transform: 'translate(-50%, -50%)' }} onClick={onEndGame}>End Game</button>}

        <Card number={-1} discard={discardPile} currentPlayer={username} playerDecks={playerHands} selected={selected} flippedCards={flippedCards} setSelected={setSelected} drawnCard={drawnCard} gameState={gameState}
          giveBurn={giveBurn} />
        {cardComponents}
        <Card number={0} discard={discardPile} currentPlayer={username} playerDecks={playerHands} selected={selected} flippedCards={flippedCards} setSelected={setSelected} drawnCard={drawnCard} gameState={gameState}
          giveBurn={giveBurn} doDraw={doDraw} waitDraw={waitDraw} />
      </div>
    </div>
  );
};

export default GameUI;
