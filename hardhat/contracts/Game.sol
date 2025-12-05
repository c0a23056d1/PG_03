// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Game {
    uint8[] public deck;
    mapping(address => uint8[]) private playerHands;
    mapping(address => uint8[]) private dealerHands; // ディーラーの手札も記録

    // イベント: ゲームの結果を通知する
    event GameResult(address player, string result, uint256 playerScore, uint256 dealerScore);
    event CardDrawn(address player, uint8 cardValue, string suit, string rank);

    function startGame() public {
        _initializeDeck();
        _shuffleDeck();
        delete playerHands[msg.sender];
        delete dealerHands[msg.sender]; // ディーラーの手札もリセット
    }

    function drawCard() public {
        require(deck.length > 0, "No cards left");
        uint8 card = deck[deck.length - 1];
        deck.pop();
        playerHands[msg.sender].push(card);
        
        (string memory suit, string memory rank) = _getCardDetails(card);
        emit CardDrawn(msg.sender, card, suit, rank);
    }

    // ★追加: プレイヤーが「スタンド（勝負）」した時の処理
    function stand() public {
        uint256 playerScore = calculateScore(playerHands[msg.sender]);
        
        // 1. ディーラーがカードを引く（17点以上になるまで）
        while (calculateScore(dealerHands[msg.sender]) < 17) {
            if (deck.length == 0) break;
            uint8 card = deck[deck.length - 1];
            deck.pop();
            dealerHands[msg.sender].push(card);
        }

        uint256 dealerScore = calculateScore(dealerHands[msg.sender]);
        string memory result;

        // 2. 勝敗判定
        if (playerScore > 21) {
            result = "Lose (Bust)";
        } else if (dealerScore > 21) {
            result = "Win (Dealer Bust)";
        } else if (playerScore > dealerScore) {
            result = "Win";
        } else if (playerScore == dealerScore) {
            result = "Draw";
        } else {
            result = "Lose";
        }

        // 3. 結果をブロックチェーンに記録
        emit GameResult(msg.sender, result, playerScore, dealerScore);
    }

    function getMyHand() public view returns (uint8[] memory) {
        return playerHands[msg.sender];
    }

    function getDealerHand() public view returns (uint8[] memory) {
        return dealerHands[msg.sender];
    }

    // 点数計算ロジックを共通化（プレイヤーもディーラーも同じルールで計算）
    function calculateScore(uint8[] memory hand) private pure returns (uint256) {
        uint256 score = 0;
        uint256 aceCount = 0;

        for (uint256 i = 0; i < hand.length; i++) {
            uint8 cardRank = hand[i] % 13;
            if (cardRank == 0) {
                aceCount++;
                score += 11;
            } else if (cardRank >= 9) {
                score += 10;
            } else {
                score += (cardRank + 1);
            }
        }

        while (score > 21 && aceCount > 0) {
            score -= 10;
            aceCount--;
        }
        return score;
    }

    // --- 内部処理 ---
    function _initializeDeck() private {
        deck = new uint8[](0);
        for (uint8 i = 0; i < 52; i++) {
            deck.push(i);
        }
    }

    function _shuffleDeck() private {
        for (uint256 i = 0; i < deck.length; i++) {
            uint256 n = i + uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, i))) % (deck.length - i);
            uint8 temp = deck[n];
            deck[n] = deck[i];
            deck[i] = temp;
        }
    }

    function _getCardDetails(uint8 cardValue) private pure returns (string memory, string memory) {
        string[4] memory suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
        string[13] memory ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        return (suits[cardValue / 13], ranks[cardValue % 13]);
    }
}