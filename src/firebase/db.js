// src/firebase/db.js
import { db } from './config';
import { collection, addDoc, setDoc, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

export const createRoom = async (roomName, host, UUID) => {
    const roomRef = doc(db, 'rooms', UUID);
    await setDoc(roomRef, {
        Name: roomName,
        UUID: UUID,
        Host: host,
        LastWinner: host,
        Players: [host],
        CurrentPlayer: 0,
        Status: 'open',
        PlayerHands: [],
        FinishedBurning: [],
        FlippedCards: [],
        Discard: [],
        BurnPhase: false,
        CambioCalled: false,
        CambioCaller: '',
        GameLog: [],
    });
    joinRoom(roomRef.id, host);
    return roomRef.id;
};

export const joinRoom = async (roomId, player) => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) throw new Error('Room does not exist');
    const roomData = roomSnap.data();
    if (roomData.Players.length >= 6) throw new Error('Room is full');
    if (roomData.Status != 'open') throw new Error('Game in progress');
    await updateDoc(roomRef, { Players: arrayUnion(player) });

    const userDoc = doc(db, 'users', player);
    await updateDoc(userDoc, { Games: arrayUnion({id: roomId, name: roomData.Name}) });
};
