import Github from 'github-api'

const github = new Github({
  token: process.env.GITHUB_TOKEN,
})

export default github
