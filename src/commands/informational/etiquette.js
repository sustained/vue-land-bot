import { Command } from 'discord.js-commando'
import {
  respondWithPaginatedEmbed,
  createDefaultEmbed,
} from '../../utils/embed'
import { cleanupInvocation } from '../../utils/messages'
import { inlineCode } from '../../utils/string'
import etiquette from '../../../data/etiquette'

module.exports = class InfoQuestionEqiquetteCommand extends Command {
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
      name: 'etiquette',
      group: 'informational',
      examples: [
        inlineCode('!etiquette'),
        inlineCode('!etiquette user'),
        inlineCode('!etiquette @user#1234'),
      ],
      aliases: ['howtoask', 'asking'],
      guildOnly: true,
      memberName: 'etiquette',
      description: 'Explain the etiquette of asking questions.',
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
      etiquette.map(item => this.buildResponseEmbed(msg, item)),
      [],
      {
        sendToChannel,
      }
    )

    cleanupInvocation(msg)
  }

  buildResponseEmbed(msg, entry) {
    return createDefaultEmbed(msg)
      .setTitle(`Question Etiquette - ${entry.title}`)
      .setDescription(entry.description)
  }
}
