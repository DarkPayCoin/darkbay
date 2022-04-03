import React from 'react';
import { Product } from '@darkpay/dark-types/substrate/interfaces';
import HiddenButton from '../utils/HiddenButton';
import { ProductUpdate, OptionId, OptionBool, OptionIpfsContent, OptionPrice } from '@darkpay/dark-types/substrate/classes';
import { isComment } from './view-product';

type HiddenProductButtonProps = {
  product: Product,
  asLink?: boolean
};

export function HiddenProductButton (props: HiddenProductButtonProps) {
  const { product } = props;
  const hidden = product.hidden.valueOf()

  const newTxParams = () => {
    const update = new ProductUpdate(
      {
      // If we provide a new storefront_id in update, it will move this product to another storefront.
        storefront_id: new OptionId(),
        content: new OptionIpfsContent(),
        price_usd: new OptionPrice(),
        tax_pct: new OptionPrice(),
        discount_pct: new OptionPrice(),
        buyer_esc_pct: new OptionPrice(),
        seller_esc_pct: new OptionPrice(),
        ship_cost: new OptionPrice(),
        hidden: new OptionBool(!hidden) // TODO has no implementation on UI
      });
    return [ product.id, update ];
  };

  return <HiddenButton type={isComment(product.extension) ? 'comment' : 'product'} newTxParams={newTxParams} struct={product} {...props} />
}

export default HiddenProductButton;
