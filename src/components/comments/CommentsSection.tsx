import React from 'react'
import { Storefront } from '@darkpay/dark-types/substrate/interfaces'
import { ViewComment } from './ViewComment';
import { NewComment } from './CreateComment';
import { mdToText } from 'src/utils';
import { HeadMeta } from '../utils/HeadMeta';
import { ProductWithSomeDetails, ProductData } from '@darkpay/dark-types/dto';
import { NextPage } from 'next';
import { getProfileName } from '../substrate';
import { Pluralize } from '../utils/Plularize';
import ViewProductLink from '../products/ViewProductLink';
import { CommentsTree } from './CommentTree';
import Section from '../utils/Section';

type CommentSectionProps = {
  storefront: Storefront,
  product: ProductWithSomeDetails,
  replies?: ProductWithSomeDetails[],
  hashId?: string,
  withBorder?: boolean
}

export const CommentSection: React.FunctionComponent<CommentSectionProps> = React.memo(({ product, hashId, storefront, replies = [], withBorder }) => {
  const { product: { struct } } = product
  const { replies_count } = struct
  const totalCount = replies_count.toString()

  return <Section id={hashId} className={`DfCommentSection ${withBorder && 'TopBorder'}`}>
    <h3><Pluralize count={totalCount} singularText='comment' /></h3>
    <NewComment product={struct} asStub />
    <CommentsTree rootProduct={product} parent={struct} storefront={storefront} replies={replies} />
  </Section>
})

type CommentPageProps = {
  comment: ProductWithSomeDetails,
  parentProduct: ProductData,
  storefront: Storefront,
  replies: ProductWithSomeDetails[]
}

export const CommentPage: NextPage<CommentPageProps> = ({ comment, parentProduct, replies, storefront }) => {
  const { product: { struct, content }, owner } = comment;
  const { content: productContent } = parentProduct;
  const address = struct.owner.toString()
  const profileName = getProfileName({ address, owner }).toString()

  const renderResponseTitle = () => <>
    In response to{' '}
    <ViewProductLink storefront={storefront} product={parentProduct.struct} title={productContent?.title} />
  </>

  return <Section className='DfContentPage DfEntireProduct'>
    <HeadMeta title={`${profileName} commented on ${content?.title}`} desc={mdToText(content?.body)} />
    {renderResponseTitle()}
    <ViewComment storefront={storefront} comment={comment} replies={replies} withShowReplies />
  </Section>
}
