// src/App.js
import React, { useState, createContext, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from './components/Auth';
import Lobby from './components/Lobby';
import Room from './components/Room';
import './App.css';

// import { getAuth, signInAnonymously } from 'firebase/auth';

export const UserContext = createContext({
  username: '',
  setUsername: () => { },
});


function App() {
  const [username, setUsername] = useState('');

  const value = useMemo(
    () => ({ username, setUsername }),
    [username]
  );
  // useEffect(() => {
  //   const auth = getAuth();
  //   signInAnonymously(auth)
  //     .then(() => {
  //       console.log("Signed in anonymously");
  //     })
  //     .catch((error) => {
  //       console.error("Error signing in: ", error);
  //     });
  // }, []);
  return (
    <UserContext.Provider value={value}>
      {useMemo(() => (
        <>
          <Router>
            <Routes>
              <Route path="/" element={<Auth />} />
              <Route path="/join" element={<Auth />} />
              <Route path="/lobby" element={<Lobby />} />
              <Route path="/room/:roomId" element={<Room/>} />
            </Routes>
          </Router>
        </>
      ), [])}
    </UserContext.Provider>
  );
}

export default App;
