import { Command } from 'discord.js-commando'
import {
  findRFCs,
  filterRFCsBy,
  RFCDoesNotExistError,
} from '../../services/rfcs'
import {
  EMPTY_MESSAGE,
  DISCORD_EMBED_DESCRIPTION_LIMIT,
} from '../../utils/constants'
import { cleanupInvocation } from '../../utils/messages'
import { inlineCode, addEllipsis } from '../../utils/string'
import {
  respondWithPaginatedEmbed,
  DEFAULT_EMBED_COLOUR,
  createDefaultEmbed,
} from '../../utils/embed'

module.exports = class RFCsCommand extends Command {
  constructor(client) {
    super(client, {
      args: [
        {
          key: 'query',
          type: 'optional-kv-pair',
          prompt: 'an RFC number, title, body, author or label to search for?',
          validate(val) {
            if (Array.isArray(val)) {
              return ['id', 'title', 'body', 'author', 'label'].includes(val[0])
            }

            return true
          },
        },
      ],
      name: 'rfc',
      examples: [
        inlineCode('!rfcs'),
        inlineCode('!rfc #23'),
        inlineCode('!rfc initial placeholder'),
        inlineCode('!rfc empty node'),
        inlineCode('!rfc yyx'),
        inlineCode('!rfc core'),
        inlineCode('!rfc id:29'),
        inlineCode('!rfc title:initial placeholder'),
        inlineCode('!rfc body:empty node'),
        inlineCode('!rfc author:yyx'),
        inlineCode('!rfc label:core'),
        inlineCode('!rfc label:breaking change,router'),
        inlineCode('!rfc label:3.x | core'),
      ],
      group: 'rfcs',
      guildOnly: false,
      memberName: 'rfc',
      description: 'Search for and view a Vue RFC.',
      argsPromptLimit: 1,
    })
  }

  hasPermission() {
    return true
  }

  async run(msg, args) {
    let { query } = args
    let [filter, value] = query

    let embed

    try {
      let rfcs

      if (filter === 'empty') {
        rfcs = await findRFCs(value)
      } else {
        rfcs = await filterRFCsBy(filter, value)
      }

      if (rfcs.length === 0) {
        throw new RFCDoesNotExistError()
      } else if (rfcs.length === 1) {
        embed = this.buildResponseEmbed(msg, rfcs[0])
      } else {
        return respondWithPaginatedEmbed(
          msg,
          this.buildDisambiguationEmbed(msg, rfcs, filter, value),
          rfcs.map(rfc => this.buildResponseEmbed(msg, rfc, filter, value))
        )
      }
    } catch (error) {
      if (error instanceof RFCDoesNotExistError) {
        embed = this.buildErrorEmbed(
          msg,
          "Sorry, I couldn't find any matches for your query on the RFC repo.",
          query
        )
      } else {
        console.error(error)
        embed = this.buildErrorEmbed(
          msg,
          'Sorry, an unspecified error occured!',
          query
        )
      }
    } finally {
      await msg.channel.send(EMPTY_MESSAGE, embed)
      cleanupInvocation(msg)
    }
  }

  buildErrorEmbed(msg, error, query = []) {
    let [filter, value] = query
    let lookup = filter === 'empty' ? value : `${filter}:${value}`

    return createDefaultEmbed(msg)
      .setTitle(`RFC Lookup - ${inlineCode(lookup)}`)
      .setDescription(error)
      .setColor('RED')
  }

  buildResponseEmbed(msg, rfc) {
    const embed = createDefaultEmbed(msg)
      .setURL(rfc.html_url)
      .setTitle(`RFC #${rfc.number} - ${rfc.title}`)
      .addField('Author', rfc.user.login, true)
      .addField('Status', rfc.state, true)

    embed.setDescription(addEllipsis(rfc.body, DISCORD_EMBED_DESCRIPTION_LIMIT))

    let footerSections = []

    if (rfc.created_at) {
      footerSections.push(
        'Created: ' + new Date(rfc.created_at).toLocaleDateString()
      )
    }

    if (rfc.updated_at) {
      footerSections.push(
        'Updated: ' + new Date(rfc.updated_at).toLocaleDateString()
      )
    }

    if (footerSections.length) {
      embed.setFooter(footerSections.join(' | '))
    }

    if (rfc.labels.length) {
      embed.addField(
        'Labels',
        rfc.labels.map(label => label.name).join(', '),
        true
      )
    }

    let labelsWithColours = rfc.labels.filter(label =>
      ['core', 'vuex', 'router'].includes(label.name)
    )

    if (labelsWithColours.length) {
      embed.setColor(`#${labelsWithColours[0].color}`)
    } else {
      embed.setColor(DEFAULT_EMBED_COLOUR)
    }

    return embed
  }

  buildDisambiguationEmbed(msg, rfcs, filter, value) {
    let query = filter === 'empty' ? value : `${filter}:${value}`

    return createDefaultEmbed(msg)
      .setTitle(`RFC Request - ${inlineCode(query)}`)
      .setDescription(
        `Sorry, I couldn't find an exact match for your query on the RFC repo.`
      )
      .addField(
        'Perhaps you meant one of these:',
        rfcs.map(rfc => inlineCode('#' + rfc.number)).join(', ')
      )
      .setColor('BLUE')
  }
}
