import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { FaCrown } from 'react-icons/fa';

const EndGameScreen = ({ roomData, username, onReturnToRoom, shaky, winner, onReturnToLobby }) => {
    const [showConfetti, setShowConfetti] = useState(true);
    const [revealWinner, setRevealWinner] = useState(false);
    const navigate = useNavigate();

    const value = (number) => {
        if (number === -1) {
            return 0;
        }
        const rankIndex = (number - 1) % 13;
        const suitIndex = Math.floor((number - 1) / 13);

        if (rankIndex === 12 && (suitIndex === 1 || suitIndex === 2)) {
            return -1;
        }
        if (rankIndex >= 10) {
            return 10;
        }
        return rankIndex + 1;
    };

    function numberToCard(number) {
        if (number === -1) {
            return 'Empty';
        }
        const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        const suits = ["♣️", "♦️", "♥️", "♠️"];
        const rankIndex = (number - 1) % 13;
        const suitIndex = Math.floor((number - 1) / 13);
        return `${ranks[rankIndex]} ${suits[suitIndex]}`;
    }

    const handleAnimationComplete = () => {
        setRevealWinner(true);
    };

    return (
        <motion.div
            className="end-game-screen"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 80 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#1a1a1d',
                color: '#eaeaea',
                padding: '20px',
                zIndex: 1000,
                overflow: 'hidden',
            }}
        >
            {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

            <h1 style={{ textAlign: 'center', color: '#4caf50' }}>Game Over!</h1>
            {/* <h2 style={{ textAlign: 'center' }}>Winner: {revealWinner && winner}</h2> */}

            <div className="player-columns" style={{ display: 'flex', justifyContent: 'center', gap: '40px', padding: '20px' }}>
                {roomData.PlayerHands.map((player, index) => {
                    const isWinner = roomData.Players[index] === winner;
                    const totalScore = player.cards.reduce((total, card) => total + value(card), 0);

                    return (
                        <motion.div
                            key={index}
                            className={`player-column ${revealWinner && isWinner ? 'winner' : ''}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.8, duration: 0.7 }}
                            style={{
                                backgroundColor: '#333',
                                border: revealWinner && isWinner ? '2px solid gold' : '1px solid #555',
                                padding: '20px',
                                borderRadius: '8px',
                                width: '150px',
                                textAlign: 'center',
                                position: 'relative',
                            }}
                        >
                            {revealWinner && isWinner && (
                                <FaCrown style={{
                                    color: 'gold',
                                    position: 'absolute',
                                    top: '-30px',
                                    fontSize: '2rem',
                                    left: '50%',
                                    transform: 'translateX(-50%)'
                                }} />
                            )}
                            <h3>{roomData.Players[index]}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', flexGrow: 1 }}>
                                {player.cards.map((card, cardIndex) => (
                                    (card !== -1 && <motion.div
                                        key={cardIndex}
                                        className="card"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: cardIndex * 0.5 }}
                                        style={{
                                            fontSize: '1.5rem',
                                            padding: '5px',
                                            backgroundColor: '#444',
                                            color: '#eaeaea',
                                            borderRadius: '4px',
                                            marginBottom: '8px',
                                            textAlign: 'center',
                                            width: '100%',
                                            height: '50px',
                                        }}
                                        // onAnimationComplete={shaky}
                                    >
                                        {numberToCard(card)}
                                    </motion.div>)
                                ))}
                                <motion.div
                                    className="score"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: player.cards.length * 0.5 }}
                                    style={{
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        marginTop: '10px',
                                        color: revealWinner && isWinner ? 'gold' : '#eaeaea',
                                    }}
                                    onAnimationComplete={index === roomData.PlayerHands.length - 1 ? handleAnimationComplete : undefined}
                                >
                                    Total Score: {totalScore}
                                </motion.div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                {username === roomData.Host ? (
                    <button
                        onClick={onReturnToRoom}
                        style={{
                            padding: '10px 20px',
                            fontSize: '1rem',
                            backgroundColor: '#4caf50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Return to Room
                    </button>
                ) : (
                    <button
                        disabled
                        style={{
                            padding: '10px 20px',
                            fontSize: '1rem',
                            backgroundColor: '#777',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'not-allowed',
                            position: 'relative',
                        }}
                    >
                        Waiting for Host
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [1, 0, 0, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            style={{ paddingLeft: '5px' }}
                        >.</motion.span>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            style={{ paddingLeft: '5px' }}
                        >.</motion.span>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            style={{ paddingLeft: '5px' }}
                        >.</motion.span>
                    </button>
                )}
                <button
                    onClick={()=>{navigate('/lobby')}}
                    style={{
                        padding: '10px 20px',
                        fontSize: '1rem',
                        backgroundColor: '#f44336',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Return to Lobby
                </button>
            </div>
        </motion.div>
    );
};

export default EndGameScreen;
