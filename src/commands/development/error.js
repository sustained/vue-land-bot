import { Command } from 'discord.js-commando'

/*
  This development-only command just throws an error.
*/
module.exports = class DevelopmentPaginateCommand extends Command {
  constructor(client) {
    super(client, {
      enabled: process.env.NODE_ENV === 'development',
      guarded: true,
      name: 'error',
      examples: ['!error'],
      group: 'development',
      guildOnly: false,
      memberName: 'error',
      description: 'Create a command error.',
    })
  }

  hasPermission() {
    return true
  }

  async run() {
    throw new Error('Well, you asked for it.')
  }
}