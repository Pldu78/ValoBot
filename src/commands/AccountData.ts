import {Command} from "../Command";
import {BaseCommandInteraction, Client, MessageEmbed} from "discord.js";
import {SlashCommandBuilder} from "@discordjs/builders";

import {ValoScraper} from '../scraper/ValoScraper';
import {IAccountContent} from "../scraper/InterfaceContent";

export const accountData: Command = {
    data: new SlashCommandBuilder()
        .setName("get")
        .setDescription("get player data")
        .addSubcommand((command) =>
            command.setName("accountdata").setDescription("retrieve user data").addStringOption((option) =>
                option.setName("pseudo_valo").setDescription("valorant username i.e. Sova").setRequired(true))
                .addStringOption((option) =>
                    option.setName("tag").setDescription("valorant tag without # i.e VAL").setRequired(true)))
    ,
    run: async (client: Client, interaction: BaseCommandInteraction) => {
        let args: Array<string> = interaction.options.data.map(i => i.options.map(t => t.value)) as unknown as string[];

        let valoScraper: ValoScraper = new ValoScraper();
        let argument = args[0][1].split('#').length>0?args[0][1].split('#')[args[0][1].split('#').length-1]:args[0][1];
        let accountContent: IAccountContent | string = await valoScraper.accountDataParse({
            name: args[0][0],
            tag: argument
        });
        let content;

        if (accountContent === "An error occured may be wrong username or tag" && typeof accountContent !== "object") {
            content = accountContent;

            await interaction.followUp({
                ephemeral: true,
                content
            })
        } else {
            accountContent = accountContent as IAccountContent;
            content = new MessageEmbed().setColor('#FF0000').setTitle('Valorant account information').setThumbnail("attachment://valo_icon.png").addFields([{
                name: 'Name : ',
                value: accountContent.name,
                inline: true
            }, {
                name: 'Tag : ',
                value: accountContent.tag,
                inline: true
            }, {
                name: 'Region : ',
                value: accountContent.region,
            }, {
                name: 'Level : ',
                value: accountContent.account_level.toString(10),
                inline: true
            }]);

            await interaction.followUp({
                ephemeral: true,
                embeds: [content],
                files:['src/valo_icon.png']
            });
        }
    }
};