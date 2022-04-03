import { StorefrontContent, ProductContent, OrderingContent, NamedLink } from "@darkpay/dark-types"
import { nonEmptyStr } from "@darkpay/dark-utils"

export const getNonEmptyStorefrontContent = (content: StorefrontContent): StorefrontContent => {
  const { tags, links, ...rest } = content
  return {
    tags: getNonEmptyStrings(tags),
    links: getNonEmptyLinks(links) as [],
    ...rest
  }
}

export const getNonEmptyOrderingContent = (content: OrderingContent): OrderingContent => {
  const {  address1, ...rest } = content
  return {
    address1: address1,
    ...rest
  }
}



export const getNonEmptyProductContent = (content: ProductContent): ProductContent => {
  const { tags, ...rest } = content
  return {
    tags: getNonEmptyStrings(tags),
    ...rest
  }
}




const getNonEmptyStrings = (inputArr: string[] = []): string[] => {
  const res: string[] = []
  inputArr.forEach(x => {
    if (nonEmptyStr(x)) {
      res.push(x.trim())
    }
  })
  return res
}

type Link = string | NamedLink

const getNonEmptyLinks = (inputArr: Link[] = []): Link[] => {
  const res: Link[] = []
  inputArr.forEach(x => {
    if (nonEmptyStr(x)) {
      res.push(x.trim())
    } else if (typeof x === 'object' && nonEmptyStr(x.url)) {
      const { name } = x
      res.push({
        name: nonEmptyStr(name) ? name.trim() : name,
        url: x.url.trim()
      })
    }
  })
  return res
}
