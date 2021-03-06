import { Command } from 'discord.js-commando'
import {
  respondWithPaginatedEmbed,
  createDefaultEmbed,
} from '../../utils/embed'
import { cleanupInvocation } from '../../utils/messages'
import { inlineCode } from '../../utils/string'
import sharing from '../../../data/sharing'

module.exports = class InfoSharingCommand extends Command {
  constructor(client) {
    super(client, {
      args: [
        {
          key: 'member',
          type: 'member',
          prompt: 'who to DM the message to (optional)?',
          default: 'none',
        },
      ],
      name: 'sharing',
      group: 'informational',
      examples: [
        inlineCode('!sharing'),
        inlineCode('!sharing user'),
        inlineCode('!sharing @user#1234'),
      ],
      aliases: ['sharingcode', 'reproduction', 'repro'],
      guildOnly: true,
      memberName: 'sharing',
      description:
        'Explain how to share code, to aid reproduction and helping.',
    })
  }

  hasPermission() {
    return true
  }

  async run(msg, args) {
    const { member } = args

    let sendToChannel
    if (member === 'none') {
      sendToChannel = msg.channel
    } else {
      sendToChannel = await member.createDM()
      let response = await msg.reply(
        `okay, I sent ${member.displayName} a DM about that as requested.`
      )
      cleanupInvocation(response)
    }

    respondWithPaginatedEmbed(
      msg,
      null,
      sharing.map(item => this.buildEmbed(msg, item)),
      [],
      {
        sendToChannel,
        observeReactionsFor: 1000 * 60 * 30,
      }
    )

    cleanupInvocation(msg)
  }

  buildEmbed(msg, entry) {
    return createDefaultEmbed(msg)
      .setURL(entry.url)
      .setTitle(`Sharing Code - ${entry.title}`)
      .setDescription(entry.description)
  }
}
