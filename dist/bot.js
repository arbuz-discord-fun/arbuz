import { Client, GatewayIntentBits } from 'discord.js';
import { TOKEN, GUILD_ID, CHANNEL_ID } from './config.js';
import { setClient } from './roles.js';
import { setChannelGetter } from './dayEnd.js';
import { startScheduler } from './scheduler.js';
import { handleArbuz } from './commands/arbuz.js';
import { handleDa } from './commands/da.js';
import { handleNet } from './commands/net.js';
import { handleTop } from './commands/top.js';
import { handleSetrole } from './commands/setrole.js';
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});
export function getChannel() {
    const ch = client.channels.cache.get(CHANNEL_ID);
    return (ch instanceof Object && 'send' in ch) ? ch : null;
}
client.once('ready', () => {
    console.log(`Залогинился как ${client.user?.tag}`);
    setClient(client);
    setChannelGetter(getChannel);
    startScheduler();
});
client.on('messageCreate', async (message) => {
    if (message.author.bot)
        return;
    if (!message.guild || message.guild.id !== GUILD_ID)
        return;
    const cmd = message.content.trim().split(/\s+/)[0]?.toLowerCase();
    try {
        if (cmd === '!arbuz')
            return void await handleArbuz(message);
        if (cmd === '!да')
            return void await handleDa(message);
        if (cmd === '!нет')
            return void await handleNet(message);
        if (cmd === '!top')
            return void await handleTop(message);
        if (cmd === '!setrole')
            return void await handleSetrole(message);
    }
    catch (err) {
        console.error(`Ошибка в команде "${cmd}":`, err);
        message.reply('⚠️ Внутренняя ошибка. Попробуй ещё раз.').catch(() => { });
    }
});
export async function startBot() {
    await client.login(TOKEN);
}
