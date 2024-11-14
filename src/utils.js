export function numberToCard(number) {
    if(number >= 53){
        return '🤡';
    }
    if(number === -1){
        return 'Empty';
    }
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const suits = ["♣️", "♦️", "♥️", "♠️"];

    const rankIndex = (number - 1) % 13;
    const suitIndex = Math.floor((number - 1) / 13);

    return `${ranks[rankIndex]}${suits[suitIndex]}`;
}
