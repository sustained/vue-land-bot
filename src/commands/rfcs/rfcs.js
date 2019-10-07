import { Command } from 'discord.js-commando'
import { RichEmbed } from 'discord.js'
import { getAllRFCs } from '../../services/rfcs'
import { tryDelete } from '../../utils/messages'
import {
  respondWithPaginatedEmbed,
  DEFAULT_EMBED_COLOUR,
} from '../../utils/embed'

const RFCS_PER_PAGE = 8

module.exports = class RFCsCommand extends Command {
  constructor(client) {
    super(client, {
      args: [
        {
          key: 'filter',
          type: 'string',
          validate(value) {
            return ['all', 'open', 'closed', 'popular'].includes(value)
          },
          prompt: 'the filter (all, open, closed, merged, popular)?',
          default: 'all',
        },
      ],
      name: 'list-rfcs',
      group: 'rfcs',
      aliases: ['rfcs'],
      examples: [
        '!rfcs',
        '!rfcs all',
        '!rfcs open',
        '!rfcs closed',
        '!rfcs merged',
        '!rfcs popular',
      ],
      guildOnly: false,
      memberName: 'rfcs',
      description: 'List all (open/closed/merged/popular) RFCs.',
    })
  }

  hasPermission() {
    return true
  }

  async run(msg, args) {
    const { filter } = args

    const embed = new RichEmbed()
      .setTitle('Vue.js Requests for Comments')
      .setDescription(`Viewing RFCs filtered by: ${filter}.`)
      .setColor(DEFAULT_EMBED_COLOUR)

    try {
      let rfcs = await getAllRFCs()

      if (filter === 'open' || filter === 'closed') {
        rfcs = rfcs.filter(rfc => rfc.state === filter)
      } else if (filter === 'popular' || filter === 'merged') {
        return msg.reply('Not yet implemented')
      }

      rfcs = rfcs.map(rfc => {
        return {
          name: `#${rfc.number} - ${rfc.title}`,
          value: rfc.html_url,
        }
      })

      respondWithPaginatedEmbed(msg, embed, rfcs, {
        itemsPerPage: RFCS_PER_PAGE,
        observeReactionsFor: 1000 * 60 * 5,
      })
    } catch (e) {
      const response = await msg.reply('Sorry, an unknown error occured.')
      tryDelete(msg)
      tryDelete(response, 7500)
    }
  }
}