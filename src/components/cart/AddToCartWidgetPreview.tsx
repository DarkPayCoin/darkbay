import React from 'react'
import { HasStorefrontIdOrHandle } from '../urls'
import { IconWithLabel } from '../utils'
import { useAuth } from '../auth/AuthContext'
import { ProductWithSomeDetails, ProductData } from '@darkpay/dark-types'
import { ShoppingCartOutlined } from '@ant-design/icons'
import { useCart } from "react-use-cart";
import { isMyAddress } from '../auth/MyAccountContext'
import { notification } from 'antd'

type Props = {
  storefront: HasStorefrontIdOrHandle
  product: ProductData
  productdetails: ProductWithSomeDetails
  title?: string
  hint?: string
  className?: string
}

export const AddToCartWidgetPreview = ({
  storefront,
  product,
  productdetails,
  title,
  hint,
  className
}: Props) => {


  const { openSignInModal, state: { completedSteps: { isSignedIn } } } = useAuth()

  const ProductTitle = product.content?.title
  const ProductId = productdetails.product.struct.id
  const ProductImage = productdetails.product.content?.image
  const ProductSf = productdetails.product.struct.storefront_id
  const ProductSeller = productdetails.product.struct.owner


  const ProductPrice = Number(productdetails.product.struct.price_usd) / 100
  // console.log('DEBUG PRICE **** '+productdetails.product.struct.price)

  const BuyerEscrow = productdetails.product.content?.bescrow
  const SellerEscrow = productdetails.product.content?.sescrow
  const ShipCost = Number(productdetails.product.struct.ship_cost) / 100
  const ShipsTo = productdetails.product.content?.shipsto

  const isMyProduct = isMyAddress(productdetails.product.struct.owner);


  // const openNotification = (ProductTitle: string | undefined) => {
  //   notification.open({
  //     type: 'success',
  //     message: 'Item added to your cart',
  //     description:
  //       ProductTitle,
  //     onClick: () => {
  //       console.log('Add to cart Notification Clicked!');
  //     },
  //   });
  // };

  const warnOwnProduct = (ProductTitle: string | undefined) => {
    notification.open({
      type: 'warning',
      message: 'You can not order own products!',
      description:
        ProductTitle,
      onClick: () => {
      },
    });
  };


  const {
    addItem,
  } = useCart();






  const data = {
    "id": (Number(ProductId)).toString(),
    "img": ProductImage,
    "name": ProductTitle,
    "price": ProductPrice,
    "sfId": ProductSf,
    "seller": ProductSeller,
    "bescrow": BuyerEscrow,
    "sescrow": SellerEscrow,
    "shipcost": ShipCost,
    "shipsto": ShipsTo,
  }


  // const addToCart = (data: { name: string | undefined; }) => {
  //   console.log('***** ADD TO CART TRIGGERED ****')

  //   openNotification(data.name)

  // }

  const productPriceView = ((product.struct.price_usd as any) / 100).toFixed(2)
  // console.log('** Got price --> ' + ProductPrice)


  return <>


    <div className="addtocartPreview-btn">
      {isMyProduct ?
    <a
    className='ant-btn ant-btn-primary ownProduct'
    onClick={() => warnOwnProduct(data.name)}
    title={'Own product'}
    >
    <IconWithLabel icon={<ShoppingCartOutlined />} label={'Own product'} />
    {/* <TickerDarkUsd /> */}
    </a>
        :
        <a
          className='ant-btn ant-btn-primary addtocartPreview'
          onClick={() => isSignedIn ? addItem(data) : openSignInModal('AuthRequired')}
          title={title}
        >
          <IconWithLabel icon={<ShoppingCartOutlined />} label={title} />
          {/* <TickerDarkUsd /> */}
        </a>

      }
      <span className='previewProductViewPrice'>{productPriceView} $</span>

    </div>
  </>
}

export default AddToCartWidgetPreview


