// // src/components/RulesModal.js
// import React, { useState } from 'react';

// const RulesModal = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleModal = () => setIsOpen(!isOpen);

//   return (
//     <>
//       <button className="rules-button" onClick={toggleModal}>Game Rules</button>
//       {isOpen && (
//         <div className="modal-overlay" onClick={toggleModal}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <h2>Game Rules</h2>
//             <p>Welcome to Cambio! Here are the rules:</p>
//             <ul>
//               <li>Each player is dealt a set of face-down cards.</li>
//               <li>Players can choose to discard or swap cards with other players.</li>
//               <li>Special cards have unique effects that change gameplay dynamics.</li>
//               <li>If you believe you have the lowest score, call "Cambio!"</li>
//               <li>At the end of the round, the player with the lowest score wins.</li>
//             </ul>
//             <button onClick={toggleModal}>Close</button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default RulesModal;
import React from 'react';

const RulesModal = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Game Rules</h2>
            <p>
              The objective of Cambio is to accumulate fewer points than your opponents by replacing high cards with low ones, burning cards, and swapping cards with others. The game ends when a player calls "Cambio," after which each player gets one last turn, and the player with the lowest sum wins.
            </p>
            <h3>Setup</h3>
            <p>
              Use a standard 54-card deck. Each player receives 4 cards face down in a 2x2 grid. Players may look at the 2 cards closest to them. The first player is decided randomly, and subsequent rounds start with the previous round's winner.
            </p>
            <h3>Play</h3>
            <p>
              Players take turns clockwise, drawing a card from the pile and replacing one of their own cards or discarding it. If you believe you have the lowest score, you can call "Cambio!" instead of drawing.
            </p>
            <h3>Choice Cards</h3>
            <p>
              Some cards have special actions that can be used when drawn and discarded in the same turn:
            </p>
            <table>
              <thead>
                <tr>
                  <th>Card</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>7, 8</td><td>Peek at one of your own cards.</td></tr>
                <tr><td>9, 10</td><td>Peek at one of another player’s cards.</td></tr>
                <tr><td>Jack, Queen</td><td>Swap two cards (without looking).</td></tr>
                <tr><td>Black King</td><td>Look at two cards; choose to swap.</td></tr>
                <tr><td>Red King</td><td>-1 point.</td></tr>
              </tbody>
            </table>
            <h3>Calling Cambio</h3>
            <p>
              A player may call "Cambio" if they believe they have the lowest score. After calling, all other players take one last turn.
            </p>
            <h3>Endgame</h3>
            <p>
              After the last turn, players reveal their cards and count points. The player with the lowest score wins. The lowest possible score is -2 if holding two red kings.
            </p>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default RulesModal;