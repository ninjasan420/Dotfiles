const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Shut up, Clyde',
    author: 'Joe 🎸#7070',
    description: "Silences Clyde saying stupid shit about Nitro, for users that don't have it.",
    color: '#7289da',

    load: async function() {
        const gg = window.EDApi.findModule(m => m.getChannelId && m.getGuildId && !m.getPings), bs = window.EDApi.findModule('Messages').Messages;

        window.EDApi.monkeyPatch(window.EDApi.findModule('sendBotMessage'), 'sendBotMessage', function (b) {
            if (gg.getGuildId() !== null) return; // don't send Clyde messages when looking at a server
            const message = b.methodArguments[1];
            if (message == bs.INVALID_ANIMATED_EMOJI_BODY_UPGRADE || message == bs.INVALID_ANIMATED_EMOJI_BODY || message == bs.INVALID_EXTERNAL_EMOJI_BODY_UPGRADE || message == bs.INVALID_EXTERNAL_EMOJI_BODY) return;
            return b.callOriginalMethod(b.methodArguments);
        });
    },
    unload: function() {
        window.EDApi.findModule('sendBotMessage').sendBotMessage.unpatch();
    }
});
