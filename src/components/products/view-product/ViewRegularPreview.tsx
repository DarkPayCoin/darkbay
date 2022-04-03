import React, { useState } from 'react';
import { StorefrontData } from '@darkpay/dark-types/dto';
import { CommentSection } from '../../comments/CommentsSection';
import { InfoProductPreview, ProductActionsPanel, ProductNotFound } from './helpers';
import { PreviewProps } from './ProductPreview';
import { isVisible } from 'src/components/utils';

export type InnerPreviewProps = PreviewProps & {
  storefront: StorefrontData
}

type ComponentType = React.FunctionComponent<InnerPreviewProps>

export const RegularPreview: ComponentType = (props) => {
  const { productDetails, storefront, replies, withTags, withActions } = props
  const extStruct = productDetails.ext?.product.struct
  const [ commentsSection, setCommentsSection ] = useState(false)

  return !extStruct || isVisible({ struct: extStruct, address: extStruct.owner })
    ? <>
      <InfoProductPreview productDetails={productDetails} storefront={storefront} withTags={withTags} />
      {withActions && <ProductActionsPanel productDetails={productDetails} storefront={storefront.struct} toogleCommentSection={() => setCommentsSection(!commentsSection) } preview withBorder />}
      {commentsSection && <CommentSection product={productDetails} replies={replies} storefront={storefront.struct} withBorder />}
    </>
    : <ProductNotFound />
}
