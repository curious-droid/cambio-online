import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, onSnapshot, updateDoc, arrayRemove, getDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import BottomBar from './BottomBar';
import { UserContext } from '../App';
import { autoSignIn } from '../firebase/auth';
import GameUI from './GameUI';
import "@fontsource/source-code-pro"
import ScreenShake from '../ScreenShake';
import { SiHackaday } from 'react-icons/si';
import { IoEllipseSharp } from 'react-icons/io5';
import EndGameScreen from './EndGameScreen';
import { motion } from 'framer-motion';
import { numberToCard } from '../utils.js';

const Room = () => {
    const { username, setUsername } = useContext(UserContext);
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [roomData, setRoomData] = useState(null);
    const [copied, setCopied] = useState(false);
    const [flippedCards, setFlippedCards] = useState([]);
    const previousCambioCalled = useRef(null); // Add ref to store previous CambioCalled value

    // const [drawnCard, setDrawnCard] = useState(null);
    const [shake, setShake] = useState(false);
    const [drawnCard, setDrawnCard] = useState(0);

    const [gameState, setGameState] = useState('locked');
    const [waitDraw, setWaitDraw] = useState(false);
    const [giveBurn, setGiveBurn] = useState(false);
    const [burnReceiver, setBurnReceiver] = useState('');
    const [selected, setSelected] = useState([]);

    const shaky = () => {
        // Trigger the shake effect
        setShake(true);

        // Reset shake after the animation duration (0.4s here)
        setTimeout(() => setShake(false), 400);
    };

    const cardExists = (card) => {
        if (roomData.Discard.includes(card)) {
            return true;
        }
        for (const player of roomData.PlayerHands) {
            if (player.cards.includes(card)) {
                return true;
            }
        }
        return false;
    }

    const drawCard = async () => {
        const usedCards = new Set((roomData.Discard ? roomData.Discard : []).concat(...roomData.PlayerHands.map(player => player.cards)));

        if (usedCards.size >= 52) {
            await updateDoc(doc(db, 'rooms', roomId), {
                Discard: [-1],
                GameLog: [...roomData.GameLog, 'Draw deck reshuffled.']
            });
            roomData.Discard = [-1];
        }

        let card = Math.floor(Math.random() * 52) + 1;
        while (cardExists(card)) {
            card = Math.floor(Math.random() * 52) + 1;
        }
        return card;
    };

    const startBurn = async () => {
        // let burn = Array(roomData.Players.length).fill(false);
        // if(roomData.CambioCaller === username){
        //     burn[roomData.Players.indexOf(username)] = false;
        // }
        updateDoc(doc(db, 'rooms', roomId), {
            FinishedBurning: Array(roomData.Players.length).fill(false),
            BurnPhase: true
        });
        // setGameState('burn');
    }

    async function handleGameState() {
        if (!roomData) {
            return;
        }
        // console.log('Handling gameState:', gameState);
        if (gameState === 'draw') {
            if (selected.length === 1) {
                const card = selected[0];
                let discarded = 0;

                setSelected([]);
                let drawn = drawnCard;
                setDrawnCard(0);
                if (roomData.Discard.includes(card)) {
                    discarded = drawn;
                    updateDoc(doc(db, 'rooms', roomId), {
                        DrawnCard: 0,
                        Discard: [...roomData.Discard, drawn],
                        GameLog: [...roomData.GameLog, `${username} discarded ${numberToCard(drawn)}.`]
                    });
                }
                else {
                    discarded = card;
                    for (const player of roomData.PlayerHands) {
                        if (player.cards.includes(card)) {
                            player.cards = player.cards.map(c => c === card ? drawn : c);
                        }
                    }
                    updateDoc(doc(db, 'rooms', roomId), {
                        DrawnCard: 0,
                        PlayerHands: roomData.PlayerHands,
                        Discard: [...roomData.Discard, card],
                        GameLog: [...roomData.GameLog, `${username} discarded ${numberToCard(card)}.`]
                    });
                }

                const rankIndex = (discarded - 1) % 13;
                const suitIndex = Math.floor((discarded - 1) / 13);

                if (rankIndex === 6 || rankIndex === 7) {
                    if (roomData.PlayerHands[roomData.Players.indexOf(username)].cards.length !== 0) {
                        setGameState('peekSelf');
                    }
                    else {
                        startBurn();
                    }
                } else if (rankIndex === 8 || rankIndex === 9) {
                    if (roomData.PlayerHands.reduce((count, playerHand, index) => { return (index !== roomData.Players.indexOf(username) && index !== roomData.Players.indexOf(roomData.CambioCaller)) ? count + playerHand.cards.length : count }, 0) !== 0) {
                        setGameState('peekOther');
                    }
                    else {
                        startBurn();
                    }
                } else if (rankIndex === 10 || rankIndex === 11) {
                    if (roomData.PlayerHands.reduce((count, playerHand, index) => { return index !== roomData.Players.indexOf(roomData.CambioCaller) ? count + playerHand.cards.length : count }, 0) >= 2) {
                        setGameState('swap');
                    }
                    else {
                        startBurn();
                    }
                } else if (rankIndex === 12 && (suitIndex === 0 || suitIndex === 3)) {
                    if (roomData.PlayerHands.reduce((count, playerHand, index) => { return index !== roomData.Players.indexOf(roomData.CambioCaller) ? count + playerHand.cards.length : count }, 0) >= 2) {
                        setGameState('lookSwap');
                    }
                    else {
                        startBurn();
                    }
                } else {
                    startBurn();
                }
            }
            else {
                if (drawnCard === 0) {
                    setDrawnCard(roomData.DrawnCard);
                }
            }
        }
        else if (gameState === 'peekSelf') {
            if (selected.length === 1) {
                setFlippedCards(selected);
                setTimeout(async () => {
                    setSelected([]);
                    setFlippedCards([]);
                    startBurn();
                }, 5000);
            }
        }
        else if (gameState === 'peekOther') {
            if (selected.length === 1) {
                setFlippedCards(selected);
                setTimeout(async () => {
                    setSelected([]);
                    setFlippedCards([]);
                    startBurn();
                }, 5000);
            }
        }
        else if (gameState === 'swap') {
            if (selected.length === 2) {
                const [card1, card2] = selected;
                for (const player of roomData.PlayerHands) {
                    player.cards = player.cards.map(c => (c === card1) ? card2 : ((c === card2) ? card1 : c));
                }
                updateDoc(doc(db, 'rooms', roomId), {
                    PlayerHands: roomData.PlayerHands,
                });
                setSelected([]);
                startBurn();
            }
        }
        else if (gameState === 'lookSwap') {
            if (selected.length === 2) {
                setFlippedCards(selected);
            }
        }
        else if (gameState === 'burn') {
            if (selected.length === 1) {
                if (giveBurn) {
                    const card = selected[0];
                    for (const player of roomData.PlayerHands) {
                        if (player.id === burnReceiver) {
                            player.cards[player.cards.indexOf(-1)] = card;
                        }
                        else if (player.id === username) {
                            player.cards = player.cards.map(c => c === card ? -1 : c);
                        }
                    }
                    setGiveBurn('');
                    setBurnReceiver('');
                    setSelected([]);
                    updateDoc(doc(db, 'rooms', roomId), {
                        PlayerHands: roomData.PlayerHands
                    });
                }
                else {
                    const card = selected[0];
                    const discardIndex = (roomData.Discard[roomData.Discard.length - 1] - 1) % 13;
                    const rankIndex = (card - 1) % 13;
                    if (discardIndex === rankIndex) {
                        let burner = username;
                        for (const player of roomData.PlayerHands) {
                            if (player.cards.includes(card)) {
                                if (player.id !== username) {
                                    setGiveBurn(true);
                                    setBurnReceiver(player.id);
                                    burner = player.id;
                                }
                                player.cards = player.cards.map(c => c === card ? -1 : c);
                            }
                        }
                        updateDoc(doc(db, 'rooms', roomId), {
                            PlayerHands: roomData.PlayerHands,
                            Discard: [...roomData.Discard, card],
                            FlippedCards: [...roomData.FlippedCards, card],
                            GameLog: [...roomData.GameLog, `${username} burned ${burner}'s ${numberToCard(card)}.`]
                        });
                    }
                    else {
                        let burner = username;
                        const drawnCard = await drawCard();
                        for (const player of roomData.PlayerHands) {
                            if (player.cards.includes(card)) {
                                burner = player.id;
                                if (player.id !== username) {
                                    player.cards = player.cards.map(c => c === card ? drawnCard : c);
                                }
                                else {
                                    if (player.cards.indexOf(-1) === -1) {
                                        player.cards = [...player.cards, drawnCard];
                                    }
                                    else {
                                        player.cards[player.cards.indexOf(-1)] = drawnCard;
                                    }
                                }
                            }
                            else if (player.id === username) {
                                if (player.cards.indexOf(-1) === -1) {
                                    player.cards = [...player.cards, card];
                                }
                                else {
                                    player.cards[player.cards.indexOf(-1)] = card;
                                }
                            }
                        }
                        updateDoc(doc(db, 'rooms', roomId), {
                            PlayerHands: roomData.PlayerHands,
                            FlippedCards: [...roomData.FlippedCards, card],
                            GameLog: [...roomData.GameLog, `${username} failed to burn ${burner}'s ${numberToCard(card)}.`]
                        });
                    }
                    setSelected([]);

                    setTimeout(async () => {
                        updateDoc(doc(db, 'rooms', roomId), {
                            FlippedCards: roomData.FlippedCards
                        });
                    }, 5000);
                }
            }
        }
    }

    useEffect(() => {
        handleGameState();
    }, [selected, gameState, setGameState]);

    const onSwap = async () => {
        if (!roomData) {
            return;
        }
        setFlippedCards([]);
        const [card1, card2] = selected;
        for (const player of roomData.PlayerHands) {
            player.cards = player.cards.map(c => (c === card1) ? card2 : ((c === card2) ? card1 : c));
        }
        updateDoc(doc(db, 'rooms', roomId), {
            PlayerHands: roomData.PlayerHands,
        });

        setSelected([]);
        startBurn();
    }

    const onNotSwap = () => {
        setFlippedCards([]);
        setSelected([]);
        startBurn();
    }

    useEffect(() => {
        async function signIN() {
            var success = await autoSignIn(setUsername);
            if (!success) {
                navigate('/');
            }
        }
        signIN();
    }, [navigate, setUsername]);

    const cardDraw = async () => {
        const card = await drawCard();
        await updateDoc(doc(db, 'rooms', roomId), {
            DrawnCard: card
        });
        setDrawnCard(card);
    }

    const value = (number) => {

        const rankIndex = (number - 1) % 13;
        const suitIndex = Math.floor((number - 1) / 13);

        if (rankIndex === 12 && (suitIndex === 1 || suitIndex === 2)) {
            return -1;
        }
        if (rankIndex >= 10) {
            return 10;
        }
        return rankIndex + 1;
    }


    useEffect(() => {
        // console.log(window.innerWidth);
        // console.log(window.innerHeight);
        if (roomData && roomData.Status === 'in-progress') {
            if (gameState === 'draw') {
                setDrawnCard(roomData.DrawnCard);
            }
            else {
                setDrawnCard(0);
            }

            if (roomData.CurrentPlayer === username && roomData.CambioCalled && roomData.CambioCaller === username) {
                const scores = roomData.PlayerHands.map(player =>
                    player.cards.reduce((total, card) => total + value(card), 0)
                );
                const minScore = Math.min(...scores);
                const minScoreIndices = scores
                    .map((score, index) => (score === minScore ? index : -1))
                    .filter(index => index !== -1);
                
                const cambioCallerIndex = roomData.Players.indexOf(roomData.CambioCaller);
                
                let winnerIndex = minScoreIndices.reduce((closestIndex, currentIndex) => {
                    const closestDistance = (closestIndex - cambioCallerIndex + roomData.Players.length) % roomData.Players.length;
                    const currentDistance = (currentIndex - cambioCallerIndex + roomData.Players.length) % roomData.Players.length;
                    return currentDistance < closestDistance ? currentIndex : closestIndex;
                }, minScoreIndices[0]);
                
                
                updateDoc(doc(db, 'rooms', roomId), {
                    LastWinner: roomData.Players[winnerIndex],
                    GameLog: [...roomData.GameLog, `${roomData.Players[winnerIndex]} won the game!`],
                    Status: 'ended'
                });
                
                return;
            }

            if (roomData.CurrentPlayer === -1) {
                setSelected([]);
                setGameState('locked');
            }
            else if (!roomData.FinishedBurning[roomData.Players.indexOf(username)]) {
                setGameState('burn');
                if (roomData.CambioCaller === username) {
                    handleBurn();
                    // roomData.FinishedBurning[roomData.Players.indexOf(username)] = false;
                    // updateDoc(doc(db, 'rooms', roomId), {
                    //     FinishedBurning: roomData.FinishedBurning
                    // });
                }
            }
            else if (((!roomData.FinishedBurning.includes(false)) && (gameState === 'locked' && !roomData.BurnPhase)) && roomData.CurrentPlayer === username) {
                if (roomData.DrawnCard === 0) {
                    setWaitDraw(true);
                }
                else {
                    setWaitDraw(false);
                    setGameState('draw');
                }
            }
            else if ((!roomData.FinishedBurning.includes(false)) && ((gameState === 'burn' && !giveBurn) && roomData.BurnPhase)) {
                setGameState('locked');
                if (roomData.CurrentPlayer === username) {
                    updateDoc(doc(db, 'rooms', roomId), {
                        CurrentPlayer: roomData.Players[(roomData.Players.indexOf(username) + 1) % roomData.Players.length],
                        FlippedCards: [],
                        BurnPhase: false,
                        GameLog: [...roomData.GameLog, `${roomData.Players[(roomData.Players.indexOf(username) + 1) % roomData.Players.length]}'s turn.`]
                    });
                }
            }

            if (roomData.CurrentPlayer === -1) {
                roomData.PlayerHands.forEach(player => {
                    if (player.id === username) {
                        setFlippedCards([player.cards[2], player.cards[3]]);
                    }
                });
            }
            else {
                setFlippedCards(roomData.FlippedCards);
            }
        }
    }, [roomData, gameState]);

    const leave = async () => {
        console.log(username);
        const userDoc = doc(db, 'users', username);
        const userData = await getDoc(userDoc);
        updateDoc(userDoc, { Games: userData.data().Games.filter((game) => game.id !== roomId) });
    }

    useEffect(() => {
        if (!username) return; // Wait until username is set
        const roomRef = doc(db, 'rooms', roomId);
        const unsubscribe = onSnapshot(roomRef, async (doc) => {
            if (!doc.exists()) {
                await leave();
                navigate('/');
                return;
            }

            const newRoomData = doc.data();

            // Check if CambioCalled changed from false to true
            if (previousCambioCalled.current === false && newRoomData.CambioCalled) {
                shaky(); // Trigger shake effect
            }

            // Update previousCambioCalled to reflect the current state
            previousCambioCalled.current = newRoomData.CambioCalled;

            setRoomData(newRoomData);
        });

        return () => unsubscribe();
    }, [roomId, navigate, username]);

    const handleDraw = () => {
        if (waitDraw) {
            setGameState('draw');
            setWaitDraw(false);
            cardDraw();
        }
    }

    const generateHand = (existingNumbers) => {
        const hand = [];
        while (hand.length < 4) {
            const card = Math.floor(Math.random() * 52) + 1;
            if (!existingNumbers.has(card)) {
                hand.push(card);
                existingNumbers.add(card);
            }
        }
        return hand;
    };

    const startGame = async () => {
        if (roomData && roomData.Host === username) {
            // if (roomData.Players.length < 2) {
            //     alert('Must have at least two players to start game.')
            //     return;
            // }
            const existingNumbers = new Set();
            const playerHands = roomData.Players.map((player) => ({
                id: player,
                cards: generateHand(existingNumbers),
            }));
            await updateDoc(doc(db, 'rooms', roomId), {
                CurrentPlayer: -1,
                Status: 'in-progress',
                PlayerHands: playerHands,
                FinishedBurning: Array(roomData.Players.length).fill(true),
                BurnPhase: false,
                DrawnCard: 0,
                Discard: [-1],
                FlippedCards: [],
                CambioCalled: false,
                CambioCaller: '',
                GameLog: [...roomData.GameLog, 'New game started.', 'Bottom two cards revealed.']
            });

            setTimeout(async () => {
                const roomRef = doc(db, 'rooms', roomId);

                // Get the latest room data
                const latestRoomSnapshot = await getDoc(roomRef);
                const latestRoomData = latestRoomSnapshot.data();

                // Check if GameLog exists; if not, default to an empty array
                const updatedGameLog = [...(latestRoomData.GameLog || []), 'Cards hidden.', `${latestRoomData.LastWinner}'s turn.`];

                // console.log(roomData.GameLog);
                await updateDoc(doc(db, 'rooms', roomId), {
                    CurrentPlayer: latestRoomData.LastWinner,
                    GameLog: updatedGameLog
                });
            }, 5000);
        }
    };
    const endGame = async () => {
        if (roomData && roomData.Host === username) {
            await updateDoc(doc(db, 'rooms', roomId), { Status: 'open', GameLog: [...roomData.GameLog, 'Game ended by host.'] });
        }
    };

    const leaveRoom = async () => {
        if (roomData) {
            if (username === roomData.Host) {
                if (!window.confirm("Confirm Action: this will delete the room.")) {
                    return;
                }
                await deleteDoc(doc(db, 'rooms', roomId));
            }
            const userDoc = doc(db, 'users', username);
            await updateDoc(userDoc, { Games: arrayRemove({ id: roomId, name: roomData.Name }) });
            navigate('/');
        }
    };

    const handleCopyLink = () => {
        const joinLink = `${window.location.origin}/join?roomId=${roomId}`;
        navigator.clipboard.writeText(joinLink)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch((error) => console.error("Copy failed:", error));
    };

    if (!roomData) return <p>Loading room...</p>;

    const handleBurn = () => {
        const updatedFinishedBurning = [...roomData.FinishedBurning];
        updatedFinishedBurning[roomData.Players.indexOf(username)] = true;
        updateDoc(doc(db, 'rooms', roomId), {
            FinishedBurning: updatedFinishedBurning,
        });
    };

    const handleCallCambio = () => {
        if (roomData && !roomData.CambioCalled && waitDraw) {
            updateDoc(doc(db, 'rooms', roomId), {
                CurrentPlayer: roomData.Players[(roomData.Players.indexOf(username) + 1) % roomData.Players.length],
                CambioCalled: true,
                CambioCaller: username,
                GameLog: [...roomData.GameLog, `${username} called Cambio!`]
            });
        }
    };

    return (
        <div className="room">
            {roomData.Status === 'open' ? (
                <div>
                    <div style={{ textAlign: 'center', position: 'relative' }}>
                        <h1 style={{ display: 'inline-block', margin: 0 }}>Cambio Online</h1>
                        <span style={{
                            color: '#4caf50',
                            fontWeight: 'bold',
                            fontSize: '1em',
                            marginLeft: '8px',
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            // right: '-60px', // Adjust as needed to place to the right of the centered text
                        }}>
                            [beta+]
                        </span>
                    </div>
                    <h2>Room: {roomData.Name} ({roomData.UUID})</h2>
                    <h3>
                        Join Code: <span style={{ color: '#4caf50' }}>{roomData.UUID}</span>
                    </h3>
                    <h3>Players: ({roomData.Players.length}/6)</h3>
                    <div>
                        <ul style={{ listStylePosition: 'inside', paddingLeft: '0px' }}>
                            {roomData.Players.map((player, index) => (
                                <li key={index}>{player}{roomData.Host === player ? ' 👑 (host)' : ''}</li>
                            ))}
                        </ul>
                    </div>
                    {roomData.Host === username && (
                        <button onClick={startGame}>Start Game</button>
                    )}
                    <button onClick={() => navigate('/')}>Return to Lobby</button>
                    <div>
                        <button onClick={leaveRoom} style={{ backgroundColor: 'red' }}>{roomData.Host === username ? 'End' : 'Leave'} Room</button>
                    </div>
                    <div className="join-link">
                        <button style={{ backgroundColor: 'transparent', fontSize: '1.2rem', textDecoration: 'underline' }} onClick={handleCopyLink}><a>{window.location.origin}/join?roomId={roomId}</a>
                        </button>
                    </div>
                    <div>
                        {copied && <span className="copied-message">Copied to clipboard!</span>}
                    </div>
                </div>
            ) : (
                <ScreenShake triggerShake={shake}>
                    <GameUI
                        username={username}
                        roomName={roomData.Name}
                        roomUUID={roomData.UUID}
                        playerHands={roomData.PlayerHands}
                        discardPile={roomData.Discard}
                        gameState={gameState}
                        flippedCards={flippedCards}
                        host={roomData.Host}
                        onBurn={handleBurn}
                        onEndGame={endGame}
                        onCallCambio={handleCallCambio}
                        GameLog={roomData.GameLog}
                        FinishedBurning={roomData.FinishedBurning}
                        giveBurn={giveBurn}
                        selected={selected}
                        setSelected={setSelected}
                        drawnCard={drawnCard}
                        onSwap={onSwap}
                        onNotSwap={onNotSwap}
                        CambioCalled={roomData.CambioCalled}
                        doDraw={handleDraw}
                        waitDraw={waitDraw}
                        CambioCaller={roomData.CambioCaller}
                        burnReceiver={burnReceiver}
                    // cards={{ drawnCard }} // Pass current cards to CambioUI
                    />
                </ScreenShake>
            )}

            {/* Render EndGameScreen if game has ended */}
            {(roomData && (roomData.Status === 'ended')) && (
                <motion.div
                    initial={{ y: '-100%' }}
                    animate={{ y: 0 }}
                    transition={{ type: 'spring', stiffness: 80 }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        zIndex: 10,
                    }}
                >
                    <EndGameScreen
                        roomData={roomData}
                        username={username}
                        onReturnToRoom={() => { if (username === roomData.Host) updateDoc(doc(db, 'rooms', roomId), { Status: 'open' }); }}
                        shaky={shaky}
                        winner={roomData.LastWinner}
                    />
                </motion.div>
            )}

            {/* Render RulesModal */}
            <BottomBar />
        </div>
    );
};

export default Room;
