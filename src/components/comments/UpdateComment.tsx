import React from 'react';
import { ProductUpdate, OptionBool, OptionIpfsContent, OptionPrice } from '@darkpay/dark-types/substrate/classes';
import { IpfsCid, Product } from '@darkpay/dark-types/substrate/interfaces';
import dynamic from 'next/dynamic';
import { CommentContent, ProductContent } from '@darkpay/dark-types';
import { registry } from '@darkpay/dark-types/substrate/registry';
import { Option } from '@polkadot/types/codec';
import { getTxParams } from '../substrate';
import BN from 'bn.js'
import { useDispatch } from 'react-redux';
import { useEditReplyToStore, CommentTxButtonType } from './utils';

const CommentEditor = dynamic(() => import('./CommentEditor'), { ssr: false });
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

type FCallback = (id?: BN) => void

type EditCommentProps = {
  struct: Product,
  content: CommentContent,
  callback?: FCallback
}

export const EditComment: React.FunctionComponent<EditCommentProps> = ({ struct, content, callback }) => {

  const dispatch = useDispatch();

  const newTxParams = (hash: IpfsCid) => {
    const update = new ProductUpdate(
      {
      // TODO setting new storefront_id will move the product to another storefront.
        storefront_id: new Option(registry, 'u64', null),
        content: new OptionIpfsContent(hash),
        price_usd: new OptionPrice(),
        tax_pct: new OptionPrice(),
        discount_pct: new OptionPrice(),
        buyer_esc_pct: new OptionPrice(),
        seller_esc_pct: new OptionPrice(),
        ship_cost: new OptionPrice(), 
        hidden: new OptionBool(false),
      });
    return [ struct.id, update ];
  }

  const id = struct.id.toString()

  const updateProductToStore = (content: ProductContent) => useEditReplyToStore(dispatch, { replyId: id, comment: { struct, content } })

  const buildTxButton = ({ disabled, json, ipfs, setIpfsCid, onClick, onFailed }: CommentTxButtonType) =>
    <TxButton
      type='primary'
      label='Edit'
      disabled={disabled}
      params={() => getTxParams({
        json: json,
        buildTxParamsCallback: newTxParams,
        ipfs,
        setIpfsCid
      })}
      tx='products.updateProduct'
      onFailed={(txResult) => {
        updateProductToStore(content as ProductContent)
        onFailed && onFailed(txResult)
      }}
      onClick={() => {
        updateProductToStore(json as ProductContent)
        onClick && onClick()
      }}
    />

  return <CommentEditor
    callback={callback}
    content={content}
    CommentTxButton={buildTxButton}
    withCancel
  />;
}
