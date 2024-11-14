// Card.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { numberToCard } from '../utils.js';

const Card = ({ number, discard, currentPlayer, playerDecks, gameState, selected, setSelected, flippedCards, drawnCard, giveBurn,doDraw, waitDraw, CambioCaller }) => {
    // const [isFlipped, setIsFlipped] = useState(false);
    // const [isSelected, setIsSelected] = useState(false);

    const discardTop = () => {
        return number === discard[discard.length - 1];
    }

    const isFlipped = () => {
        return (number !== 0 && (number === drawnCard || discard.includes(number) || flippedCards.includes(number)));
    }

    const playerWhoHas = () => {
        for (const player of playerDecks) {
            if (player.cards.includes(number)) {
                return player.id;
            }
        }
        return null;
    }

    const canClick = () => {
        if(number === 0 && waitDraw){
            return true;
        }
        if(playerWhoHas() === CambioCaller){
            return false;
        }
        if (selected.includes(number)) {
            if (gameState === 'draw') {
                return selected.length !== 1;
            }
            else if (gameState === 'peekSelf') {
                return selected.length !== 1;
            }
            else if (gameState === 'peekOther') {
                return selected.length !== 1;
            }
            else if (gameState === 'swap') {
                return selected.length !== 2;
            }
            else if (gameState === 'lookSwap') {
                return selected.length !== 2;
            }
            return true;
        }
        // if(!playerWhoHas()){
        //     return false;
        // }
        if (gameState === 'locked') {
            return false;
        }
        else if (gameState === 'draw') {
            if (discardTop()) {
                return true;
            }
            if (!discardTop() && playerWhoHas() !== currentPlayer) {
                return false;
            }
            if (selected.length >= 1) {
                return false;
            }
        }
        if (discardTop() || number === 0) {
            return false;
        }
        if (gameState === 'burn') {
            if (selected.length >= 1) {
                return false;
            }
            if (giveBurn) {
                if (playerWhoHas() !== currentPlayer) {
                    return false;
                }
            }
        }
        else if (gameState === 'peekSelf') {
            if (playerWhoHas() !== currentPlayer) {
                return false;
            }
            if (selected.length >= 1) {
                return false;
            }
        }
        else if (gameState === 'peekOther') {
            if (playerWhoHas() === currentPlayer) {
                return false;
            }
            if (selected.length >= 1) {
                return false;
            }
        }
        else if (gameState === 'swap') {
            if (selected.length >= 2) {
                return false;
            }
        }
        else if (gameState === 'lookSwap') {
            if (selected.length >= 2) {
                return false;
            }
        }
        return true;
    }

    const handleClick = () => {
        if (!canClick()) {
            return;
        }
        if(number === 0 && waitDraw){
            doDraw();
            return;
        }
        if (!selected.includes(number)) {
            setSelected([...selected, number]);
        }
        else {
            setSelected(selected.filter(card =>
                card !== number
            ))
        }
    };

    const dx = [-1, +1, +1, -1];
    const dy = [-1, -1, +1, +1];

    const currentPlayerIndex = () => {
        return playerDecks.indexOf(playerDecks.find(player => player.id === currentPlayer));
    }

    const calcX = () => {
        if (number === 0) {
            return 950;
        }
        if (discard.includes(number)) {
            return 1050;
        }
        if (number === drawnCard) {
            return 1000 - 320;
        }
        for (const player of playerDecks) {
            if (player.cards.includes(number)) {
                if (player.id === currentPlayer) {
                    return 1370 + 50 * (player.cards.indexOf(number) >= 4 ? 3 + 2 * (player.cards.indexOf(number) - 4) : dx[player.cards.indexOf(number)]);
                }
                else {
                    const playernum = playerDecks.indexOf(player) - (currentPlayerIndex() < playerDecks.indexOf(player) ? 1 : 0) - (playerDecks.length - 2) / 2.0;
                    return 1000 + 370 * playernum - 50 * (player.cards.indexOf(number) >= 4 ? 3 + 2 * (player.cards.indexOf(number) - 4) : dx[player.cards.indexOf(number)]);
                }
            }
        }
        return 950;
    }
    const calcY = () => {
        if (number === 0) {
            return 750;
        }
        if (discard.includes(number)) {
            return 750;
        }
        if (number === drawnCard) {
            return 1000;
        }
        for (const player of playerDecks) {
            if (player.cards.includes(number)) {
                if (player.id === currentPlayer) {
                    return 1150 + 130 * (player.cards.indexOf(number) >= 4 ? +1 : dy[player.cards.indexOf(number)]);
                }
                else {
                    return 200 - 130 * (player.cards.indexOf(number) >= 4 ? +1 : dy[player.cards.indexOf(number)]);
                }
            }
        }
        return 750;
    }



    return (
        <motion.div
            className={`card`}
            onClick={() => {
                handleClick();
            }}
            animate={{ x: window.innerWidth / 2000 * calcX() - 30, y: window.innerHeight / 2000 * calcY() - 45, rotateY: isFlipped() ? 0 : 180 }}
            transition={{ duration: 0.5 }}
            style={{
                position: 'absolute',
                x: window.innerWidth / 2000 * 950 - 30,
                y: window.innerHeight / 2000 * 750 - 45,
                zIndex: discardTop() ? 1 : 0,
                rotateY: 180,
                width: 60,
                height: 90,
                backgroundColor: (playerWhoHas() === CambioCaller) ? 'darkgray' :(isFlipped() ? (number === -1 ? 'darkgray' : 'whitesmoke') : ((gameState === 'locked' || number === 0 || canClick()) ? 'green' : 'darkgray')),
                color: isFlipped() ? 'black' : 'transparent',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '0.9rem',
                border: (selected.includes(number) ? '3px blue ' : ((playerWhoHas() === CambioCaller) ? '3px red ':'1px black ')) + ((number === 0 || (discard.includes(number) || (playerWhoHas() === CambioCaller))) ? 'dashed' : 'solid'),
                // borderStyle: (number === 0 || (discard.includes(number) || (playerWhoHas() === CambioCaller))) ? 'dashed' : 'solid',
                cursor: canClick() ? 'pointer' : 'not-allowed',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: (number === 0 || discard.includes(number)) ? 1 : 0.8 }}
        >
            {isFlipped() ? `${numberToCard()}` : ''}
        </motion.div>
    );
};

export default Card;
