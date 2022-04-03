import { Storefront, Product, StorefrontId, Ordering } from '@darkpay/dark-types/substrate/interfaces'
import { stringifyNumber, AnyAddress, AnyText, stringifyAddress } from '../substrate'
import { newLogger, notDef } from '@darkpay/dark-utils'
import BN from 'bn.js'
import { slugify, stringifySubUrls } from './helpers'

const log = newLogger('URLs')

// Storefront URLs
// --------------------------------------------------

export type HasStorefrontIdOrHandle = Pick<Storefront, 'id' | 'handle'>

/**
 * WARN: It's not recommended to use this hack.
 * You should pass both storefront's id and handle in order to construct
 * good looking URLs for storefronts and products that support a storefront handle.
 */
export function newStorefrontUrlFixture (id: StorefrontId | BN): HasStorefrontIdOrHandle {
  return { id } as HasStorefrontIdOrHandle
}

export function storefrontIdForUrl ({ id, handle }: HasStorefrontIdOrHandle): string {
  if (notDef(id) && notDef(handle)) {
    log.warn(`${storefrontIdForUrl.name}: Both id and handle are undefined`)
    return ''
  }

  return slugify(handle) || stringifyNumber(id) as string
}

/** /[storefrontId] */
export function storefrontUrl (storefront: HasStorefrontIdOrHandle, ...subUrls: string[]): string {
  const idForUrl = storefrontIdForUrl(storefront)
  const ending = stringifySubUrls(...subUrls)
  return '/' + idForUrl + ending
}

/** /[storefrontId]/new */
export function newStorefrontUrl (storefront: HasStorefrontIdOrHandle): string {
  return storefrontUrl(storefront, 'new')
}

/** /[storefrontId]/edit */
export function editStorefrontUrl (storefront: HasStorefrontIdOrHandle): string {
  return storefrontUrl(storefront, 'edit')
}

/** /[storefrontId]/about */
export function aboutStorefrontUrl (storefront: HasStorefrontIdOrHandle): string {
  return storefrontUrl(storefront, 'about')
}

// Product URLs
// --------------------------------------------------

export type HasProductId = Pick<Product, 'id'>

/** /[storefrontId]/products/new */
export function newProductUrl (storefront: HasStorefrontIdOrHandle): string {
  return storefrontUrl(storefront, 'products', 'new')
}

/** /[storefrontId]/products/[productId] */
export function productUrl (storefront: HasStorefrontIdOrHandle, product: HasProductId, ...subUrls: string[]): string {
  if (notDef(product.id)) {
    log.warn(`${productUrl.name}: Product id is undefined`)
    return ''
  }

  const productId = stringifyNumber(product.id) as string
  return storefrontUrl(storefront, 'products', productId, ...subUrls)
}

/** /[storefrontId]/products/[productId]/edit */
export function editProductUrl (storefront: HasStorefrontIdOrHandle, product: HasProductId): string {
  return productUrl(storefront, product, 'edit')
}

// Account URLs
// --------------------------------------------------

export type HasAddressOrHandle = {
  address: AnyAddress
  handle?: AnyText
}

export function accountIdForUrl ({ address, handle }: HasAddressOrHandle): string {
  if (notDef(address) && notDef(handle)) {
    log.warn(`${accountIdForUrl.name}: Both address and handle are undefined`)
    return ''
  }

  return slugify(handle) || stringifyAddress(address) as string
}

function urlWithAccount (baseUrl: string, account: HasAddressOrHandle, ...subUrls: string[]): string {
  return stringifySubUrls(baseUrl, accountIdForUrl(account), ...subUrls)
}

/** /accounts/[address] */
export function accountUrl (account: HasAddressOrHandle, ...subUrls: string[]): string {
  return urlWithAccount('accounts', account, ...subUrls)
}


// Ordering URLs
// --------------------------------------------------

export type HasOrderingId = Pick<Ordering, 'id'>

export function orderingIdForUrl ({ id }: HasOrderingId): string {
  if (notDef(id)) {
    log.warn(`${orderingIdForUrl.name}: Ordering Id isundefined`)
    return ''
  }

  return stringifyNumber(id) as string
}

/** /[orderingId] */
export function orderingUrl (ordering: HasOrderingId, ...subUrls: string[]): string {
  const idForUrl = orderingIdForUrl(ordering)
  const ending = stringifySubUrls(...subUrls)
  return '/' + idForUrl + ending
}

/** /[orderingId]/edit */
export function editOrderingUrl (ordering: HasOrderingId): string {
  return orderingUrl(ordering, 'edit')
}