const SUBSOCIAL_TAG = 'darkdot'

const darkdotUrl = (url: string) => `${window.location.origin}${url}`

export const twitterShareUrl =
  (
    url: string,
    text?: string
  ) => {
    const textVal = text ? `text=${text}` : ''

    return `https://twitter.com/intent/tweet?${textVal}&url=${darkdotUrl(url)}&hashtags=${SUBSOCIAL_TAG}&original_referer=${url}`
  }

export const linkedInShareUrl =
  (
    url: string,
    title?: string,
    summary?: string
  ) => {
    const titleVal = title ? `title=${title}` : ''
    const summaryVal = summary ? `summary=${summary}` : ''

    return `https://www.linkedin.com/shareArticle?mini=true&url=${darkdotUrl(url)}&${titleVal}&${summaryVal}`
  }

export const facebookShareUrl = (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${darkdotUrl(url)}`

export const redditShareUrl =
  (
    url: string,
    title?: string
  ) => {
    const titleVal = title ? `title=${title}` : ''

    return `http://www.reddit.com/submit?url=${darkdotUrl(url)}&${titleVal}`
  }

export const copyUrl = (url: string) => darkdotUrl(url)
