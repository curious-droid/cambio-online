// src/components/Auth.js
import React, { useState, useContext, useEffect } from 'react';
import { autoSignIn, signUp, signIn } from '../firebase/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createRoom, joinRoom } from '../firebase/db';
import { UserContext } from '../App';
import Cookies from 'js-cookie';
import BottomBar from './BottomBar';

const Auth = () => {
    const { username, setUsername } = useContext(UserContext);
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get('roomId');

    useEffect(() => {
        async function signIN() {
            try {
                const success = await autoSignIn(setUsername);
                if (success) {
                    if (roomId) {
                        await joinRoom(roomId, username);
                        navigate(`/room/${roomId}`);
                    } else {
                        navigate('/lobby');
                    }
                }
            } catch (error) {
                console.log(error.message);
            }
        }
        signIN();
    }, [navigate, roomId, setUsername]);

    const handleSignUp = async () => {
        try {
            await signUp(username, password, setUsername);
            // alert('Signed up successfully!');
            if (roomId) {
                await joinRoom(roomId, username);
                navigate(`/room/${roomId}`);
            } else {
                navigate('/lobby');
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const handleSignIn = async () => {
        try {
            await signIn(username, password, setUsername);
            // alert('Signed in successfully!');
            if (roomId) {
                await joinRoom(roomId, username);
                navigate(`/room/${roomId}`);
            } else {
                navigate('/lobby');
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="lobby">
            <h1>Welcome to Cambio Online!</h1>
            <div>
                <input placeholder={Cookies.get("username") ? Cookies.get("username") : "Username"} value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder={Cookies.get("password") ? Cookies.get("password") : "Password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
                <button onClick={handleSignUp}>Sign Up</button>
                <button onClick={handleSignIn}>Sign In</button>
            </div>
            <BottomBar />
        </div>
    );
};

export default Auth;
