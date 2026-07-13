/**
 * Shared in-memory per-group settings — resets on restart, same as sessions.
 */
const state = new Map(); // chatId -> { antilink: bool, welcome: bool }

function get(chatId) {
    if (!state.has(chatId)) state.set(chatId, { antilink: false, welcome: false });
    return state.get(chatId);
}

function setAntilink(chatId, on) { get(chatId).antilink = !!on; }
function setWelcome(chatId, on)  { get(chatId).welcome  = !!on; }
function isAntilinkOn(chatId)    { return get(chatId).antilink; }
function isWelcomeOn(chatId)     { return get(chatId).welcome; }

module.exports = { setAntilink, setWelcome, isAntilinkOn, isWelcomeOn };
