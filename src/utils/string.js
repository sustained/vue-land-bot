const PUNCTUATION_CHARS = ['.', '!', '?']

export function replaceTags(str, callback) {
  if (!callback) {
    callback = () => '`'
  }

  return str.replace(/<(\/)?([^>]+)>/g)
}

export function addEllipsis(str) {
  const lastChar = str.substr(str.length - 1)

  if (PUNCTUATION_CHARS.includes(lastChar)) {
    return str
  } else {
    return str + '...'
  }
}
