import { Language, LanguageStore, LanguageOptions, util } from 'klasa'
import { stripIndent, oneLine } from 'common-tags'

export default class LanguageEnUS extends Language {
  constructor(
    store: LanguageStore,
    file: string[],
    directory: string,
    options: LanguageOptions
  ) {
    super(store, file, directory, options)

    this.language = {
      RFCS_COMMAND_DESCRIPTION: oneLine`
        Interact with VueJS Requests for Comments.
      `,

      RFCS_COMMAND_EXTENDED_HELP: stripIndent`
        • The query argument is only required for the view command.
        • Look for exact matches using the --number, --title, --author and --labels flags.
          • Fuzzy search by simply not specifying a flag.
          • You can use | (or) as well as & (and) for the label flag.
        • You can filter the results using the --filter flag, for the list command.
        Examples ::
        • Fuzzy Searching RFCs
          • !rfc attr fallthrough
          • !rfc attr fallthrough
          • !rfc #7
          • !rfc better v-for
          • !rfc posva
          • !rfc router
        • Filtering RFCs precisely
          • !rfc --number=7
          • !rfc --title="better v-for"
          • !rfc --author="posva"
          • !rfc --labels=router
          • !rfc --labels=router&core
          • !rfc --labels='router | core'
        • Listing RFCs by state
          • !rfc list
          • !rfc --state=open list
          • !rfc list --state='closed'
          • !rfc list --state="popular"
      `,

      RFCS_ARGUMENT_QUERY: prefix => oneLine`
        You must specify a valid query.

        For more information consult the help command - \`${prefix}help rfc\`.
      `,

      RFCS_NO_MATCHS_TITLE: `VueJS RFC Search`,
      RFCS_NO_MATCHS_DESCRIPTION: `No results found!`,

      RFC_LIST_INVALID_FILTER: (filter, validFilters) =>
        oneLine`
          You specified an invalid filter (\`${filter}\`), valid filters are: ${validFilters}.
        `,

      RFCS_LIST_FILTER_NO_RESULTS: filter =>
        oneLine`
          No results found matching filter \`${filter}\`
        `,

      RFCS_INFO_PAGE_TITLE: oneLine`
        VueJS - Requests for Comments
      `,
      RFCS_INFO_PAGE_DESCRIPTION: stripIndent`
        • Use the ⏮, ◀, ▶ & ⏭ buttons to navigate between the pages.
        • Jump to an arbitrary page using 🔢.
        • Cancel pagination using ⏹.
        • View this information page with ℹ.
      `,

      RFCS_EMBED_TITLE: title => `VueJS RFC - ${title}`,

      RFCS_REFRESH_SUCCESS: ttl => oneLine`
        I refetched the RFCs from the Github API and re-cached them to disk.

        The cache TTL is ${ttl}.
      `,

      RFCS_REFRESH_FAILURE: force => oneLine`
        Sorry, something went wrong while fetching the RFCs from Github.
      `,

      VUEBOT_USER_LACKS_PERMISSION: permissions => oneLine`
        Sorry but you lack the permissions required (${permissions}) to perform that action.
      `,

      VUEBOT_BOT_LACKS_PERMISSION: permissions => oneLine`
        Sorry but I lack the permissions required (${permissions}) to perform that action.
      `,
    }
  }

  async init() {
    await super.init()
  }
}
