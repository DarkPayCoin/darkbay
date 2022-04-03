import { Product, Storefront } from '@darkpay/dark-types/substrate/interfaces';
import { ProductWithSomeDetails } from '@darkpay/dark-types';
import React, { useState, useCallback } from 'react'
import { nonEmptyArr, newLogger } from '@darkpay/dark-utils';
import ViewComment from './ViewComment';
import { useSelector, useDispatch } from 'react-redux';
import { getComments } from 'src/redux/slices/replyIdsByProductIdSlice';
import { Store } from 'src/redux/types';
import { useSetReplyToStore } from './utils';
import useDarkdotEffect from '../api/useDarkdotEffect';
import { LoadingOutlined } from '@ant-design/icons';
import { MutedDiv } from '../utils/MutedText';
import { isFakeId } from './helpers';
import DataList from '../lists/DataList';
import { ZERO, resolveBn } from '../utils';

const log = newLogger('CommentTree')

type LoadProps = {
  rootProduct?: ProductWithSomeDetails,
  parent: Product,
  storefront: Storefront,
  replies?: ProductWithSomeDetails[]
}

type CommentsTreeProps = {
  rootProduct?: ProductWithSomeDetails,
  storefront: Storefront,
  comments: ProductWithSomeDetails[]
}

const ViewCommentsTree: React.FunctionComponent<CommentsTreeProps> = ({ comments, rootProduct, storefront }) => {
  return nonEmptyArr(comments) ? <DataList
    dataSource={comments}
    renderItem={(item) => {
      const { product: { struct } } = item;
      const key = `comment-${struct.id.toString()}`
      return <ViewComment key={key} storefront={storefront} rootProduct={rootProduct} comment={item} withShowReplies/>
    }}
  /> : null;
}

export const DynamicCommentsTree = (props: LoadProps) => {
  const { rootProduct, parent: { id: parentId }, storefront, replies } = props;
  const parentIdStr = parentId.toString()

  if (isFakeId(props.parent)) return null

  const dispatch = useDispatch()

  const [ isLoading, setIsLoading ] = useState(true)
  const [ replyComments, setComments ] = useState(replies || []);

  const hasComments = nonEmptyArr(replyComments)

  useDarkdotEffect(({ darkdot, substrate }) => {
    if (!isLoading) return;

    let isSubscribe = true

    const loadComments = async () => {
      const replyIds = await substrate.getReplyIdsByProductId(parentId);
      const comments = await darkdot.findProductsWithAllDetails({ ids: replyIds }) || [];
      const replyIdsStr = replyIds.map(x => x.toString())
      const reply = { replyId: replyIdsStr, parentId: parentIdStr }

      if (isSubscribe) {
        setComments(comments)
        useSetReplyToStore(dispatch, { reply, comment: comments })
      }
    }

    if (hasComments) {
      const replyIds = replyComments.map(x => x.product.struct.id.toString())
      useSetReplyToStore(dispatch, { reply: { replyId: replyIds, parentId: parentIdStr }, comment: replyComments })
    } else {
      loadComments()
        .then(() => isSubscribe && setIsLoading(false))
        .catch(err => log.error('Failed to load comments: %o', err))
    }

    return () => { isSubscribe = false }

  }, [ false ]);

  return isLoading && !hasComments
    ? <MutedDiv className='mt-2 mb-2'><LoadingOutlined className='mr-1' /> Loading replies...</MutedDiv>
    : <ViewCommentsTree storefront={storefront} rootProduct={rootProduct} comments={replyComments} />
}

export const CommentsTree = (props: LoadProps) => {
  const { parent: { id: parentId, replies_count } } = props;

  const count = resolveBn(replies_count)
  const parentIdStr = parentId.toString()

  const comments = useSelector((store: Store) => getComments(store, parentIdStr));
  const hasComments = nonEmptyArr(comments)

  const Tree = useCallback(() => nonEmptyArr(comments)
  ? <ViewCommentsTree {...props} comments={comments} />
  : <DynamicCommentsTree {...props} />, [ comments.length, parentIdStr, count.toString() ])

  if (count.eq(ZERO) && !hasComments) return null;

  return <Tree />
}
