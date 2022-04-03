import { addComments, removeComment } from 'src/redux/slices/replyIdsByProductIdSlice';
import { addProduct, removeProduct, editProduct } from 'src/redux/slices/productByIdSlice';
import { Dispatch } from '@reduxjs/toolkit';
import { ProductsStoreType } from 'src/redux/types';
import { ProductData, ProductWithSomeDetails, CommentContent, ProductContent, ProfileData } from '@darkpay/dark-types';
import { DarkdotIpfsApi } from '@darkpay/dark-api/';
import { IpfsCid } from '@darkpay/dark-types/substrate/interfaces';
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton';
import { FVoid } from '../utils/types';

type Reply<T> = {
  replyId: T,
  parentId: string
}

type SetCommentStore<T> = {
  reply: Reply<T>,
  comment: ProductsStoreType
}

type EditCommentStore = {
  replyId: string,
  comment: ProductData
}

export const useRemoveReplyFromStore = (dispatch: Dispatch, reply: Reply<string>) => {
  dispatch(removeComment(reply));
  dispatch(removeProduct({ productId: reply.replyId }))
}

export const useSetReplyToStore = (dispatch: Dispatch, { reply, comment }: SetCommentStore<string | string[]>) => {
  dispatch(addComments(reply));
  dispatch(addProduct({ products: comment }))
}

export const useChangeReplyToStore = (dispatch: Dispatch, oldReply: Reply<string>, newStore: SetCommentStore<string>) => {
  useRemoveReplyFromStore(dispatch, oldReply)
  useSetReplyToStore(dispatch, newStore)
}

export const useEditReplyToStore = (dispatch: Dispatch, { replyId, comment }: EditCommentStore) => {
  dispatch(editProduct({ productId: replyId, product: comment }))
}

type MockComment = {
  fakeId: string,
  address: string,
  owner?: ProfileData,
  content: CommentContent,
  price_usd: null,
  tax_pct: null,
  discount_pct: null,
  buyer_esc_pct: null,
  seller_esc_pct: null,
  ship_cost: null,
}

export type CommentTxButtonType = {
  ipfs: DarkdotIpfsApi
  setIpfsCid: (hash: IpfsCid) => void
  json: CommentContent | ProductContent,
  fakeId?: string,
  disabled?: boolean,
  onClick?: FVoid,
  onSuccess?: TxCallback,
  onFailed?: TxFailedCallback
}

export const buildMockComment = ({ fakeId, address, owner, content }: MockComment) => {
  return {
    owner,
    product: {
      struct: {
        id: fakeId,
        created: {
          account: address,
          time: new Date().getTime()
        },
        owner: address,
        score: 0,
        shares_count: 0,
        direct_replies_count: 0,
        storefront_id: null,
        extension: { Comment: {} },
        content: { None: null },
        price_usd: null,
        tax_pct: null,
        discount_pct: null,
        buyer_esc_pct: null,
        seller_esc_pct: null,
        ship_cost: null,
        hidden: false
      },
      content: content
    }
  } as any as ProductWithSomeDetails
}
