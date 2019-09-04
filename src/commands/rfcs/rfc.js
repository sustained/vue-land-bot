import { Command } from 'discord.js-commando'
import { RichEmbed } from 'discord.js'
import { rfcs } from '../../github'
import { EMPTY_MESSAGE } from '../../utils/constants'

module.exports = class RFCsCommand extends Command {
  constructor(client) {
    super(client, {
      args: [
        {
          key: 'rfc',
          type: 'string|integer',
          prompt: 'the id of the RFC?',
        },
      ],
      name: 'rfc',
      group: 'rfcs',
      guildOnly: true,
      memberName: 'rfc',
      description: 'View a specific RFC.',
    })
  }

  hasPermission() {
    return true
  }

  async run(msg, args) {
    const { rfc } = args

    if (isNaN(rfc)) {
      return msg.reply(
        'Sorry, I only support fetching PRs by id/number for now.'
      )
    }

    rfcs
      .getPullRequest(rfc)
      .then(({ status, data: rfc }) => {
        if (status !== 200) {
          return msg.reply(
            `Sorry, something went wrong while communicating with the Github API (${status}).`
          )
        }

        const embed = new RichEmbed()
          .setTitle(`RFC #${rfc.number} - ${rfc.title}`)
          .setDescription(rfc.body)
          .setAuthor(rfc.user.login, rfc.user.avatar_url, rfc.user.html_url)
          .setTimestamp(rfc.created_at)
          .setURL(rfc.html_url)
          .addField('Status', rfc.state)

        if (rfc.labels.length) {
          embed.addField(
            'Labels',
            rfc.labels.map(label => label.name).join(', ')
          )
        }

        msg.channel.send(EMPTY_MESSAGE, { embed })
      })
      .catch(({ response }) => {
        if (response.status === 404) {
          return msg.reply('An RFC with that ID does not exist.')
        }

        return msg.reply('Sorry, an unknown error occured.')
      })
  }
}

/*
  labels
  body
  url
  state (open, closed)
  title
  created_at
  updated_at
  closed_at
  merged_at
*/