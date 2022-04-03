import React, { FunctionComponent, useState } from 'react';
import { /* CaretDownOutlined, CaretUpOutlined, */ CommentOutlined, NotificationOutlined } from '@ant-design/icons';
import { Comment, Button, Tag } from 'antd';
import { ProductWithSomeDetails } from '@darkpay/dark-types/dto';
import { CommentContent } from '@darkpay/dark-types';
import { AuthorPreview } from '../profiles/address-views/AuthorPreview';
import { Storefront } from '@darkpay/dark-types/substrate/interfaces';
import Link from 'next/link';
import { pluralize } from '../utils/Plularize';
import { formatUnixDate, IconWithLabel, isHidden, ONE, ZERO, resolveBn } from '../utils';
import moment from 'moment-timezone';
import { EditComment } from './UpdateComment';
import { CommentsTree } from './CommentTree'
import { NewComment } from './CreateComment';
import { VoterButtons } from '../voting/VoterButtons';
import { ProductDropDownMenu } from '../products/view-product';
import { CommentBody } from './helpers';
import { equalAddresses } from '../substrate';
import { productUrl } from '../urls';
import { ShareDropdown } from '../products/share/ShareDropdown';
//import { ProposerTag } from '../kusama/KusamaProposalDesc';

type Props = {
  rootProduct?: ProductWithSomeDetails,
  storefront: Storefront,
  comment: ProductWithSomeDetails,
  replies?: ProductWithSomeDetails[],
  withShowReplies?: boolean
}

export const ViewComment: FunctionComponent<Props> = ({
  rootProduct, comment, storefront = { id: 0 } as any as Storefront, replies, withShowReplies = true
}) => {
  const {
    product: {
      struct,
      content
    },
    owner
  } = comment

  if (isHidden(comment.product) || !rootProduct) return null

  const { product: { struct: rootProductStruct, } } = rootProduct

  const {
    id,
    created: { time },
    owner: commentOwnerAddress,
    score,
    replies_count
  } = struct

  const [ showEditForm, setShowEditForm ] = useState(false);
  const [ showReplyForm, setShowReplyForm ] = useState(false);
  const [ showReplies ] = useState(withShowReplies);
  const [ repliesCount, setRepliesCount ] = useState(resolveBn(replies_count))

  const isFake = id.toString().startsWith('fake')
  const commentLink = productUrl(storefront, struct)

  const isRootProductOwner = equalAddresses(
    rootProductStruct?.owner,
    struct.owner
  )

  /*   const ViewRepliesLink = () => {
    const viewActionMessage = showReplies
      ? <><CaretUpOutlined /> {'Hide'}</>
      : <><CaretDownOutlined /> {'View'}</>

    return <Link href={commentLink}>
      <a onClick={(event) => { event.preventDefault(); setShowReplies(!showReplies) }}>
        {viewActionMessage}{' '}
        <Pluralize count={repliesCount} singularText='reply' pluralText='replies' />
      </a>
    </Link>
  } */

  const isReplies = repliesCount.gt(ZERO)
  const isShowChildren = showReplyForm || showReplies || isReplies

  const ChildPanel = isShowChildren ? <div>
    {showReplyForm &&
    <NewComment
      product={struct}
      callback={(id) => {
        setShowReplyForm(false)
        id && setRepliesCount(repliesCount.add(ONE))
      }}
      withCancel
    />}
    {/* {isReplies && <ViewRepliesLink />} */}
    {showReplies && <CommentsTree rootProduct={rootProduct} parent={struct} replies={replies} storefront={storefront} />}
  </div> : null

  const actionCss = 'DfCommentAction'

  return <div className={isFake ? 'DfDisableLayout' : ''}>
    <Comment
      className='DfNewComment'
      actions={isFake ? [] : [
        <VoterButtons key={`voters-of-comments-${id}`} product={struct} className={actionCss} />,
        <Button key={`reply-comment-${id}`} className={actionCss} onClick={() => setShowReplyForm(true)}>
          <IconWithLabel icon={<CommentOutlined />} label='Reply' />
        </Button>,
        <ShareDropdown key={`dropdown-menu-of-comment-${id}`} productDetails={comment} storefront={storefront} className={actionCss} />
      ]}
      author={<div className='DfAuthorBlock'>
        <AuthorPreview
          address={commentOwnerAddress}
          owner={owner}
          isShort={true}
          isPadded={false}
          size={32}
          afterName={<>
            {isRootProductOwner
              ? <Tag color='blue'><NotificationOutlined /> Product author</Tag>
              : undefined}
            </>
          }
          details={
            <span>
              <Link href='/[storefrontId]/products/[productId]' as={commentLink}>
                <a className='DfGreyLink'>{moment(formatUnixDate(time)).fromNow()}</a>
              </Link>
              {' · '}
              {pluralize(score, 'Point')}
            </span>
          }
        />
        <ProductDropDownMenu key={`comment-dropdown-menu-${id}`} productDetails={comment} storefront={storefront} />
      </div>}
      content={showEditForm
        ? <EditComment struct={struct} content={content as CommentContent} callback={() => setShowEditForm(false)}/>
        : <CommentBody comment={comment.product} />
      }
    >
      {ChildPanel}
    </Comment>
  </div>
};

export default ViewComment;