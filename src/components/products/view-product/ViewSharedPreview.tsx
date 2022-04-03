import React, { useState } from 'react';
import { CommentSection } from '../../comments/CommentsSection';
import { ProductCreator, ProductDropDownMenu, ProductActionsPanel, ShareProductContent } from './helpers';
import { InnerPreviewProps } from '.';

type ComponentType = React.FunctionComponent<InnerPreviewProps>

export const SharedPreview: ComponentType = (props) => {
  const { productDetails, storefront, withActions, replies } = props
  const [ commentsSection, setCommentsSection ] = useState(false)

  return <>
    <div className='DfRow'>
      <ProductCreator productDetails={productDetails} storefront={storefront} withStorefrontName />
      <ProductDropDownMenu storefront={storefront.struct} productDetails={productDetails}/>
    </div>
    <ShareProductContent productDetails={productDetails} storefront={storefront} />
    {withActions && <ProductActionsPanel productDetails={productDetails} storefront={storefront.struct} toogleCommentSection={() => setCommentsSection(!commentsSection)} preview />}
    {commentsSection && <CommentSection product={productDetails} storefront={storefront.struct} replies={replies} withBorder/>}
  </>
}
