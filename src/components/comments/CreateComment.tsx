import React from 'react'
import { ProductExtension, Comment, OptionId, IpfsContent, OptionPrice } from '@darkpay/dark-types/substrate/classes'
import { useDarkdotApi } from '../utils/DarkdotApiContext'
import { IpfsCid, Product } from '@darkpay/dark-types/substrate/interfaces'
import dynamic from 'next/dynamic'
import { getNewIdFromEvent, getTxParams } from '../substrate'
import BN from 'bn.js'
import { useDispatch } from 'react-redux'
import { useMyAccount } from '../auth/MyAccountContext'
import { useSetReplyToStore, useRemoveReplyFromStore, useChangeReplyToStore, buildMockComment, CommentTxButtonType } from './utils'
import { isHiddenProduct, HiddenProductAlert } from '../products/view-product'

const CommentEditor = dynamic(() => import('./CommentEditor'), { ssr: false })
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false })

type NewCommentProps = {
  product: Product
  callback?: (id?: BN) => void
  withCancel?: boolean,
  asStub?: boolean
}

export const NewComment: React.FunctionComponent<NewCommentProps> = ({ product, callback, withCancel, asStub }) => {
  const { id: parentId, extension } = product
  const dispatch = useDispatch()
  const { darkdot } = useDarkdotApi()
  const { state: { address, account } } = useMyAccount()

  if (isHiddenProduct(product)) {
    const msg = 'You cannot comment on this product because it is unlisted'
    return <HiddenProductAlert product={product} desc={msg} className='mt-3' />
  }

  const parentIdStr = parentId.toString()

  const comment = (extension.isComment && extension.asComment) || (extension as any).Comment

  const commentExt = comment
    ? new Comment({ parent_id: new OptionId(parentId), root_product_id: comment.root_product_id })
    : new Comment({ parent_id: new OptionId(), root_product_id: parentId })

  const newExtension = new ProductExtension({ Comment: commentExt })

  const newTxParams = (cid: IpfsCid) => [ new OptionId(), newExtension, new IpfsContent(cid), new OptionPrice(), new OptionPrice(), new OptionPrice(), new OptionPrice(), new OptionPrice(), new OptionPrice()  ]

  const onFailedReduxAction = (id: string) =>
    useRemoveReplyFromStore(dispatch, { replyId: id, parentId: parentIdStr })

  const onSuccessReduxAction = (id: BN, fakeId: string) =>
    darkdot.findProductWithSomeDetails({ id })
      .then(comment => {
        comment && useChangeReplyToStore(
          dispatch,
          { replyId: fakeId, parentId: parentIdStr },
          {
            reply: { replyId: id.toString(), parentId: parentIdStr },
            comment: { ...comment, owner: account }
          }
        )
      })

  const onTxReduxAction = (body: string, fakeId: string) =>
    address && useSetReplyToStore(dispatch,
      {
        reply: { replyId: fakeId, parentId: parentIdStr },
        comment: buildMockComment({ fakeId, address, owner: account, content: { body },price_usd: null, tax_pct: null, discount_pct: null, buyer_esc_pct: null, seller_esc_pct: null, ship_cost: null, })
      })

  const buildTxButton = ({ disabled, json, fakeId, ipfs, setIpfsCid, onClick, onFailed, onSuccess }: CommentTxButtonType) =>
    <TxButton
      type='primary'
      label='Comment'
      disabled={disabled}
      params={() => getTxParams({
        json: json,
        buildTxParamsCallback: newTxParams,
        ipfs,
        setIpfsCid
      })}
      tx='products.createProduct'
      onFailed={(txResult) => {
        console.error('Comment err ===>'+fakeId+ ' = '+txResult?.dispatchError?.toString)
        fakeId && onFailedReduxAction(fakeId)
        onFailed && onFailed(txResult)
      }}
      onSuccess={(txResult) => {
        const id = getNewIdFromEvent(txResult)
        id && fakeId && onSuccessReduxAction(id, fakeId)
        onSuccess && onSuccess(txResult)
      }}
      onClick={() => {
        fakeId && onTxReduxAction(json.body, fakeId)
        onClick && onClick()
      }}
    />

  return <CommentEditor
    callback={callback}
    CommentTxButton={buildTxButton}
    withCancel={withCancel}
    asStub={asStub}
  />
}