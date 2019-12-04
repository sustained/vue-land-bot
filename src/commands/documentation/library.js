import { Command } from 'discord.js-commando'
import { getLibrary, findPossibleMatches } from '../../services/libraries'
import { RichEmbed } from 'discord.js'
import { EMPTY_MESSAGE } from '../../utils/constants'
import { tryDelete } from '../../utils/messages'
import { uppercaseFirst } from '../../utils/string'

const DELETE_MESSAGES_AFTER = 7500
const DELETE_ERRORS_AFTER = 30000

module.exports = class DocumentationLibraryCommand extends Command {
  constructor(client) {
    super(client, {
      args: [
        {
          key: 'name',
          type: 'string',
          prompt: 'Enter a tool, library or framework to look up?',
        },
      ],
      name: 'library',
      group: 'documentation',
      aliases: ['lib', 'l'],
      examples: [
        '`!library quasar`',
        '`!library vuetify`',
        '`!library nuxt`',
        '`!library gridsome`',
        '`!library saber`',
        '`!library vuepress`',
      ],
      guildOnly: false,
      memberName: 'library',
      description: 'Look up a tool, library or framework by name.',
    })
  }

  hasPermission() {
    return true
  }

  async run(msg, args) {
    const { name } = args

    let embed

    try {
      let library = getLibrary(name)
      embed = this.buildResponseEmbed(library)

      await msg.channel.send(EMPTY_MESSAGE, { embed })
      tryDelete(msg, DELETE_MESSAGES_AFTER)
    } catch (error) {
      const matches = findPossibleMatches(name)

      if (matches.length) {
        if (matches.length === 1) {
          embed = this.buildResponseEmbed(matches[0])
        } else {
          embed = this.buildDisambiguationEmbed(name, matches)
        }

        const response = await msg.channel.send(EMPTY_MESSAGE, { embed })
        tryDelete(msg, DELETE_MESSAGES_AFTER)
        tryDelete(response, DELETE_ERRORS_AFTER)
      } else {
        embed = this.buildErrorEmbed(name)

        const response = await msg.channel.send(EMPTY_MESSAGE, { embed })
        tryDelete(msg, DELETE_MESSAGES_AFTER)
        tryDelete(response, DELETE_ERRORS_AFTER)
      }
    }
  }

  buildDisambiguationEmbed(name, matches) {
    if (matches.length >= 32) {
      // Don't overwhelm user with too many matches (+ API limits).
      // TODO: Is it worth adding pagination for this feature?
      matches = matches.slice(0, 31)
    }

    matches = matches.map(match => '`' + match.name + '`').join(', ')

    return new RichEmbed()
      .setTitle(`Library Lookup - ${name}`)
      .setColor('ORANGE')
      .setDescription(
        `I couldn't find that but perhaps you meant one of these:\n\n${matches}?`
      )
  }

  buildResponseEmbed(library) {
    const embed = new RichEmbed()
      .setTitle(uppercaseFirst(library.name))
      .setColor(library.colour)

    if (library.links.site) {
      embed.setURL(library.links.site)
    } else {
      embed.setURL(library.links.repo)
    }

    if (library.description) {
      embed.setDescription(library.description)
    }

    if (library.topics.length) {
      embed.setFooter('Tags: ' + library.topics.join(', '))
    }

    if (library.icon) {
      embed.setThumbnail(`attachment://${library.icon}`).attachFile({
        attachment: `assets/images/icons/${library.icon}`,
        name: library.icon,
      })
    }

    if (library.organization) {
      embed.setAuthor(
        library.organization.login,
        library.organization.avatar_url
      )
    } else {
      embed.setAuthor(library.owner.login, library.owner.avatar_url)
    }

    if (library.fields) {
      for (const field of library.fields) {
        if (typeof field === 'object') {
          embed.addField(field.name, field.value)
        } else {
          embed.addField(EMPTY_MESSAGE, field)
        }
      }
    }

    for (const [name, url] of Object.entries(library.links)) {
      if (url !== null) {
        embed.addField(uppercaseFirst(name), url)
      }
    }

    if (library.license) {
      embed.addField('License', library.license.name, true)
    }

    return embed
  }

  buildErrorEmbed(name) {
    return new RichEmbed()
      .setTitle('Library Lookup')
      .setColor('RED')
      .setDescription(
        `Could not find a library matching `${name}`.\n\nThink it should be included?`
      )
      .addField('Submit PR', 'https://git.io/JenP0', true)
      .addField('File issue', 'https://git.io/JenP2', true)
  }
}
