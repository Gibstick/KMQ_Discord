import * as Discord from "discord.js";
import GameSession from "../models/game_session";
import GuildPreference from "../models/guild_preference";
import { Pool } from "promise-mysql";
import { ParsedMessage } from "types";

interface CommandArgs {
    client?: Discord.Client;
    gameSessions?: { [guildID: string]: GameSession }
    guildPreference?: GuildPreference;
    message?: Discord.Message;
    db?: Pool;
    parsedMessage?: ParsedMessage,
    botPrefix?: string;
}
interface CallFunc {
    (args: CommandArgs): Promise<void>
}
interface CommandValidations {
    minArgCount: number,
    maxArgCount: number,
    arguments: Array<{
        type: "number" | "boolean" | "enum" | "char",
        name: string,
        minValue?: number,
        maxValue?: number,
        enums?: Array<string>
    }>
}
class BaseCommand {
    call: CallFunc;
    help: {
        name: string,
        description: string,
        usage: string,
        arguments: Array<{ name: string, description: string }>
    };
    aliases?: Array<string>;
    validations?: CommandValidations
}

export default BaseCommand;
export {
    CommandArgs,
    CommandValidations
}