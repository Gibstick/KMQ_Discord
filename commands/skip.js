const {
    disconnectVoiceConnection,
    startGame,
    sendSongMessage,
    areUserAndBotInSameVoiceChannel,
    getNumParticipants } = require("../helpers/utils.js");
const RED = 0xE74C3C;

module.exports = {
    call: ({ gameSession, client, message, db }) => {
        if (!gameSession.gameInSession() || !areUserAndBotInSameVoiceChannel(message)) {
            return;
        }
        gameSession.userSkipped(message.author);
        if (isSkipMajority(message, gameSession)) {
            sendSongMessage(message, gameSession, false);
            sendSkipMessage(message, gameSession);
            gameSession.endRound();
            startGame(gameSession, db, message);
        }
        else {
            sendSkipNotification(message, gameSession);
        }
    }
}

function sendSkipNotification(message, gameSession) {
    message.channel.send({
        embed: {
            color: RED,
            title: "**Skip**",
            description: `${gameSession.getNumSkippers()}/${Math.floor(getNumParticipants(message) * 0.5) + 1} skips achieved.`
        }
    });
}

function sendSkipMessage(message, gameSession) {
    message.channel.send({
        embed: {
            color: RED,
            title: "**Skip**",
            description: `${gameSession.getNumSkippers()}/${Math.floor(getNumParticipants(message) * 0.5) + 1} skips achieved, skipping...`
        }
    });
}

function isSkipMajority(message, gameSession) {
    return (gameSession.getNumSkippers() / getNumParticipants(message) >= 0.5);
}
