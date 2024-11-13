// src/components/Lobby.js
import React, { useState, useContext, useEffect } from 'react';
import { createRoom, joinRoom } from '../firebase/db';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot, updateDoc, arrayRemove, deleteDoc, arrayUnion } from 'firebase/firestore';
import { signOut, autoSignIn } from '../firebase/auth';
import { UserContext } from '../App';
import BottomBar from './BottomBar';

const Lobby = () => {
    const { username, setUsername } = useContext(UserContext);
    const [roomName, setRoomName] = useState('');
    const [roomUUID, setRoomUUID] = useState('');
    const [userGames, setUserGames] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        async function signIN() {
            var success = await autoSignIn(setUsername);
            if (!success) {
                navigate('/');
            }
        }
        signIN();

        // Only proceed if username is defined
        if (!username) return;

        const fetchUserGames = async () => {
            const userDocRef = doc(db, 'users', username);
            const userDocSnap = await getDoc(userDocRef);
            const userData = userDocSnap.data();
            setUserGames(userData.Games || []);
        };

        fetchUserGames();

        const userDocRef = doc(db, 'users', username);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            setUserGames(doc.data().Games || []);
        });

        return () => unsubscribe();

    }, [username, navigate, setUsername]);

    const generateRoomId = () => {
        const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    const handleCreateRoom = async () => {
        const roomId = await createRoom(roomName, username, generateRoomId());
        navigate(`/room/${roomId}`);
    };

    const handleJoinRoom = async () => {
        try {
            await joinRoom(roomUUID, username);
            navigate(`/room/${roomUUID}`);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleSignOut = () => {
        signOut(setUsername);
        navigate(`/`);
    }

    return (
        <div className="lobby">
            <h1>Welcome to Cambio Online!</h1>
            <h3>Signed in as: {username}</h3>
            <div>
                <button onClick={handleSignOut}>Sign Out</button>
            </div>
            <div>
                <h2>Create or Join Room</h2>
                <input placeholder="Room Name" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
                <button onClick={handleCreateRoom}>Create Room</button>
            </div>
            <div>
                <input placeholder="Room UUID" value={roomUUID} onChange={(e) => setRoomUUID(e.target.value)} />
                <button onClick={handleJoinRoom}>Join Room</button>
            </div>

            <div>
                <h2>Your Games</h2>
                <div className='games'>
                    {userGames.length > 0 ? (
                        userGames.map((game) => (
                            <button key={game.id} onClick={() => navigate(`/room/${game.id}`)}>
                                {game.name} ({game.id})
                            </button>
                        ))
                    ) : (
                        <p>No games available. Create or join a game to get started!</p>
                    )}
                </div>
            </div>

            <BottomBar />
        </div>
    );
};

export default Lobby;
