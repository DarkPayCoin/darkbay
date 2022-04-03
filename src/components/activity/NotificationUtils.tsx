import React from 'react'
import moment from 'moment-timezone';
import { ViewStorefront } from '../storefronts/ViewStorefront';
import { Pluralize } from '../utils/Plularize';
import { ProfileData, StorefrontData, ProductData, Activity, ProductContent, EventsName, CommonStruct, AnyDarkdotData, AnyAccountId } from '@darkpay/dark-types';
import BN from 'bn.js'
import Link from 'next/link';
import { isDef, nonEmptyStr, notDef } from '@darkpay/dark-utils';
import { productUrl, storefrontUrl, accountUrl } from '../urls';
import { NotifActivitiesType } from './Notifications';
import messages from '../../messages'
import { summarize } from 'src/utils';
import { isSharedProduct } from '../products/view-product';
import { SocialAccount, Product } from '@darkpay/dark-types/substrate/interfaces';
import { DarkdotApi } from '@darkpay/dark-api/api/darkdot';
import { Name } from '../profiles/address-views/Name';

export type LoadMoreFn = (
  myAddress: string,
  offset: number,
  limit: number
) => Promise<Activity[]>

export type EventsMsg = {
  [key in EventsName]: string;
};

export type PathLinks = {
  links: {
    href: string,
    as?: string
  }
}

export type NotificationType = PathLinks & {
  address: string
  notificationMessage: React.ReactNode,
  details?: string,
  owner?: ProfileData
  image?: string
}

export type ActivityStore = {
  storefrontById: Map<string, StorefrontData>,
  productById: Map<string, ProductData>,
  ownerById: Map<string, ProfileData>
}

type PreviewNotification = PathLinks & {
  preview: JSX.Element | null,
  owner: AnyAccountId,
  image?: string,
  msg?: string,
}

const SUMMARIZE_LIMIT = 50

type Struct = Exclude<CommonStruct, SocialAccount>

const fillArray = <T extends string | BN>(
  id: T,
  structIds: T[],
  structByIdMap: Map<string, AnyDarkdotData>
) => {
  const struct = structByIdMap.get(id.toString())

  if (!struct) {
    structIds.push(id)
  }
}

type InnerNotificationsProps = {
  activityStore: ActivityStore,
  type: NotifActivitiesType,
  myAddress?: string
}

type LoadNotificationsProps = InnerNotificationsProps & {
  darkdot: DarkdotApi,
  activities: Activity[],
}

export const loadNotifications = async ({
  darkdot,
  activities,
  activityStore,
  type,
  myAddress
}: LoadNotificationsProps) => {
  const { storefrontById, productById, ownerById } = activityStore

  const ownerIds: string[] = []
  const storefrontIds: BN[] = []
  const productIds: BN[] = []

  activities.forEach(({ account, following_id, storefront_id, product_id, comment_id }) => {
    nonEmptyStr(account) && fillArray(account, ownerIds, ownerById)
    nonEmptyStr(following_id) && fillArray(following_id, ownerIds, ownerById)
    nonEmptyStr(storefront_id) && fillArray(new BN(storefront_id), storefrontIds, storefrontById)
    nonEmptyStr(product_id) && fillArray(new BN(product_id), productIds, productById)
    nonEmptyStr(comment_id) && fillArray(new BN(comment_id), productIds, productById)
  })

  const ownersData = await darkdot.findProfiles(ownerIds)
  const productsData = await darkdot.findPublicProducts(productIds)

  function fillMap<T extends AnyDarkdotData> (
    data: T[],
    structByIdMap: Map<string, AnyDarkdotData>,
    structName?: 'profile' | 'product'
  ) {
    data.forEach(x => {
      let id

      switch (structName) {
        case 'profile': {
          id = (x as ProfileData).profile?.created.account
          break
        }
        case 'product': {
          const struct = (x.struct as Product)
          id = struct.id
          const storefrontId = struct.storefront_id.unwrapOr(undefined)
          storefrontId && storefrontIds.push(storefrontId)
          break
        }
        default: {
          id = (x.struct as Struct).id
        }
      }

      if (id) {
        structByIdMap.set(id.toString(), x)
      }
    })
  }

  fillMap(productsData, productById, 'product'),
  fillMap(ownersData, ownerById, 'profile')

  // Only at this point we have ids of storefronts that should be loaded:
  const storefrontsData = await darkdot.findPublicStorefronts(storefrontIds)
  fillMap(storefrontsData, storefrontById)

  return activities
    .map(activity => getNotification({ activity, activityStore, myAddress, type }))
    .filter(x => x !== undefined) as NotificationType[]
}

const renderSubjectPreview = (content?: ProductContent, href = '') => {
  if (!content) return null

  const { title, body } = content
  const name = summarize(title || body || 'link', SUMMARIZE_LIMIT)
  return nonEmptyStr(name) || nonEmptyStr(href) ?
  <Link href='/[storefrontId]/products/[productId]' as={href}><a>{name}</a></Link>
  : null
}


const getStorefrontPreview = (storefrontId: BN, map: Map<string, StorefrontData>): PreviewNotification | undefined => {
  const data = map.get(storefrontId.toString())

  if (!data) return undefined

  return {
    preview: <ViewStorefront storefrontData={data} nameOnly withLink />,
    image: data?.content?.image,
    owner: data?.struct.owner,
    links: {
      href: '/[storefrontId]',
      as: data && storefrontUrl(data?.struct)
    }
  }
}

const getAccountPreview = (accountId: string, map: Map<string, ProfileData>): PreviewNotification | undefined => {
  const data = map.get(accountId)

  return {
    preview: <Name owner={data} address={accountId}/>,
    image: data?.content?.avatar,
    owner: accountId,
    links: {
      href: '/accounts/[address]',
      as: data && accountUrl({ address: accountId })
    }
  }
}

type GetProductPreviewProsp = {
  productId: BN,
  event: EventsName,
  storefrontMap: Map<string, StorefrontData>,
  productMap: Map<string, ProductData>
}

const getProductPreview = ({ productId, productMap, storefrontMap, event } :GetProductPreviewProsp): PreviewNotification | undefined => {
  const data = productMap.get(productId.toString())

  if (!data) return undefined

  const isShared = isSharedProduct(data.struct.extension)

  if (event === 'ProductCreated' && isShared) {
    const msg = messages['activities'].ProductSharing
    const sharedProductId = data.struct.extension.asSharedProduct
    const productPreview = getProductPreview({ productId: sharedProductId, storefrontMap, productMap, event })
    return productPreview
      ? { ...productPreview, msg }
      : undefined
  }

  const storefrontId = data?.struct.storefront_id.unwrapOr(undefined)
  const storefront = storefrontId && storefrontMap.get(storefrontId.toString())?.struct
  const productLink = storefront && data && productUrl(storefront, data.struct)

  if (!productLink) return undefined

  const preview = renderSubjectPreview(data?.content, productLink)
  const image = data?.content?.image;
  return {
    preview,
    image,
    owner: data.struct.owner,
    links: {
      href: '/[storefrontId]/products/[productId]',
      as: productLink
    }
  }
}

const getCommentPreview = (commentId: BN, storefrontMap: Map<string, StorefrontData>, productMap: Map<string, ProductData>): PreviewNotification | undefined => {
  const commetIdStr = commentId.toString()
  const comment = productMap.get(commetIdStr);
  const commentStruct = comment?.struct;
  const isComment = commentStruct?.extension.isComment
  if (commentStruct && isComment) {
    const { root_product_id } = commentStruct.extension.asComment

    /* if (parent_id.isSome) {
      const msg = eventsMsg.CommentReactionCreated
      // const commentBody = comment?.content?.body || '';
      // const commentTitle = summarize(commentBody, 40)
      // const commentPreview = renderSubjectPreview(commentTitle, `/comment?productId=${commentStruct.product_id}&commentId=${commentStruct.id}`)
      // const { preview: productPreview, image } = getProductPreview(productId, productMap);
      // const preview = <>{commentPreview} in {productPreview}</>
      return { ...getProductPreview(root_product_id, storefrontMap, productMap), msg }
    } */
    const data = productMap.get(root_product_id.toString())

    if (!data) return undefined

    const storefrontId = data?.struct.storefront_id.unwrapOr(undefined)
    const storefront = storefrontId && storefrontMap.get(storefrontId.toString())?.struct
    const productLink = storefront && data && productUrl(storefront, commentStruct)

    if (!productLink) return undefined

    const preview = renderSubjectPreview(data?.content, productLink)
    const image = data?.content?.image;
    return {
      preview,
      image,
      owner: data.struct.owner,
      links: {
        href: '/[storefrontId]/products/[productId]',
        as: productLink
      }
    }

  }
  return undefined;
}

const getAtivityPreview = (activity: Activity, store: ActivityStore, type: NotifActivitiesType) => {
  const { event, storefront_id, product_id, comment_id, following_id } = activity;
  const { storefrontById, productById, ownerById } = store;
  const eventName = event as EventsName

  const getCommentPreviewWithMaps = (comment_id: string) =>
    getCommentPreview(new BN(comment_id), storefrontById, productById)

  const getProductPreviewWithMaps = (product_id: string) =>
    getProductPreview({
      productId: new BN(product_id),
      storefrontMap: storefrontById,
      productMap: productById,
      event: eventName
    })

  const getStorefrontPreviewWithMaps = (storefront_id: string) =>
    getStorefrontPreview(new BN(storefront_id), storefrontById)

  const isActivity = type === 'activities'

  switch (eventName) {
    case 'AccountFollowed': return isDef(following_id) && getAccountPreview(following_id, ownerById)
    case 'StorefrontFollowed': return isDef(storefront_id) && getStorefrontPreviewWithMaps(storefront_id)
    case 'StorefrontCreated': return isDef(storefront_id) && getStorefrontPreviewWithMaps(storefront_id)
    case 'CommentCreated': return isDef(comment_id) && getCommentPreviewWithMaps(comment_id)
    case 'CommentReplyCreated': return isDef(comment_id) && getCommentPreviewWithMaps(comment_id)
    case 'ProductShared': return isActivity || notDef(product_id) ? undefined : getProductPreviewWithMaps(product_id)
    case 'CommentShared': return isDef(comment_id) && getCommentPreviewWithMaps(comment_id)
    case 'ProductReactionCreated': return isDef(product_id) && getProductPreviewWithMaps(product_id)
    case 'CommentReactionCreated': return isDef(comment_id) && getCommentPreviewWithMaps(comment_id)
    case 'ProductCreated': return isActivity && isDef(product_id) ? getProductPreviewWithMaps(product_id) : undefined
    default: return undefined
  }

}

const getNotificationMessage = (msg: string, aggregationCount: number, preview: JSX.Element | null, withAggregation: boolean) => {
  const aggregationMsg = withAggregation
    ? aggregationCount > 0 && <>&nbsp;{'and'} <Pluralize count={aggregationCount} singularText='other person' pluralText='other people' /></>
    : undefined

  return <span className="DfActivityMsg">{aggregationMsg}&nbsp;{msg}&nbsp;{preview}</span>
}

type GetNotificationProps = InnerNotificationsProps & {
  activity: Activity,
}

export const getNotification = ({ type, activityStore, activity, myAddress }: GetNotificationProps): NotificationType | undefined => {
  const { account, event, date, agg_count } = activity;
  const formatDate = moment(date).format('lll');
  const creator = activityStore.ownerById.get(account);
  const activityPreview = getAtivityPreview(activity, activityStore, type)

  if (!activityPreview) return undefined;

  const { preview, msg, owner, ...other } = activityPreview
  const msgType: NotifActivitiesType = myAddress === owner.toString() ? 'notifications' : 'activities'
  const eventMsg = messages[msgType] as EventsMsg

  const notificationMessage = getNotificationMessage(msg || eventMsg[event as EventsName], agg_count - 1, preview, type === 'notifications')

  return { address: account, notificationMessage, details: formatDate, owner: creator, ...other }
}
