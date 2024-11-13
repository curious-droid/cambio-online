// src/firebase/auth.js
import { db } from './config';
// import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Cookies from 'js-cookie';

export const autoSignIn = async (setUsername) => {
    if ((Cookies.get("username") && Cookies.get("username") !== '') && Cookies.get("password")) {
        try {
            // console.log("HERE");
            return await signIn(Cookies.get("username"), Cookies.get("password"), setUsername);
        }
        catch (error) {
            console.log(error.message);
        }
    }
    return false;
}

export const signUp = async (username, password, setUsername) => {
    const userDoc = doc(db, 'users', username);
    const userSnap = await getDoc(userDoc);
    if (userSnap.exists()) throw new Error('Username already exists');
    await setDoc(userDoc, { UserName: username, Password: password });
    signIn(username, password, setUsername);
    return true;
};

export const signIn = async (username, password, setUsername) => {
    const userDoc = doc(db, 'users', username);
    const userSnap = await getDoc(userDoc);
    const userData = userSnap.data();
    if (!userSnap.exists()) throw new Error('Account does not exist');
    if (userData.Password !== password) throw new Error('Incorrect password');
    Cookies.set('username', username, { expires: 7 });
    Cookies.set('password', password, { expires: 7 });
    setUsername(username);
    return true;
};

export const signOut = (setUsername) => {
    Cookies.remove('username');
    Cookies.remove('password');
    setUsername('');
};
