import BN from 'bn.js'
import { ZERO } from ".";
import { claimedStorefrontIds, lastReservedStorefrontId } from "./env";
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE } from "src/config/ListData.config"
import { nonEmptyStr } from '@darkpay/dark-utils'
import { tryParseInt } from "src/utils"

export const getLastNIds = (nextId: BN, size: number): BN[] => {
  const idsCount = nextId.lten(size) ? nextId.toNumber() - 1 : size

  return new Array<BN>(idsCount)
    .fill(ZERO)
    .map((_, index) =>
      nextId.sub(new BN(index + 1)))
}

type PaginationQuery = {
  page?: number | string | string[]
  size?: number | string | string[]
}

export type ParsedPaginationQuery = {
  page: number
  size: number
}

export const parsePageQuery = (props: PaginationQuery): ParsedPaginationQuery => {
  let { page = DEFAULT_FIRST_PAGE, size = DEFAULT_PAGE_SIZE } = props

  if (nonEmptyStr(page)) {
    page = tryParseInt(page, DEFAULT_FIRST_PAGE)
  }

  if (nonEmptyStr(size)) {
    size = tryParseInt(size, DEFAULT_PAGE_SIZE)
  }

  return {
    page: page as number,
    size: size as number
  }
}

export const getPageOfIds = (ids: BN[], query: PaginationQuery) => {
  const { page, size } = parsePageQuery(query)
  const offset = (page - 1) * size
  const pageOfIds = []

  for (let i = offset; i < offset + size; i++) {
    pageOfIds.push(ids[i])
  }

  return pageOfIds
}

export const approxCountOfPublicStorefronts = (nextId: BN) =>
  nextId.subn(lastReservedStorefrontId + 1)

const reverseClaimedStorefrontIds = claimedStorefrontIds.reverse()

export const getReversePageOfStorefrontIds = (nextId: BN, query: PaginationQuery) => {
  const { page, size } = parsePageQuery(query)
  const offset = (page - 1) * size
  const nextPageId = nextId.subn(offset)
  let ids = getLastNIds(nextPageId, size)

  const lowId = ids[ids.length - 1]
  // If there is a reserved storefront id among found ids:
  if (lowId.lten(lastReservedStorefrontId)) {
    ids = ids.filter(id => id.gtn(lastReservedStorefrontId))
  }

  return ids.length < size
    ? [ ...ids, ...reverseClaimedStorefrontIds ]
    : ids
}

export const getLastNStorefrontIds = (nextId: BN, size: number): BN[] => {
  const storefrontsCount = approxCountOfPublicStorefronts(nextId)
  const limit = storefrontsCount.ltn(size) ? storefrontsCount.toNumber() : size
  let storefrontIds = getLastNIds(nextId, limit)

  // We append ids of claimed storefronts in case we found
  // less number of the latest storefront ids than requested via `size` var.
  if (storefrontIds.length < size && reverseClaimedStorefrontIds.length > 0) {
    const claimedIds = reverseClaimedStorefrontIds.slice(0, size - storefrontIds.length)
    storefrontIds = storefrontIds.concat(claimedIds)
  }

  return storefrontIds.slice(0, limit)
}
