import React, { useState } from 'react'
import { HasStorefrontIdOrHandle } from '../urls'
import { IconWithLabel } from '../utils'
import { useAuth } from '../auth/AuthContext'
import { ProductWithSomeDetails, ProductData } from '@darkpay/dark-types'
import { ShoppingCartOutlined } from '@ant-design/icons'
// import { ShareModal } from './ShareModal'
import { InputNumber, notification} from 'antd';

//import { add, total } from './localstore' 
//import { Cart,} from './CartUtils
import { ProductId, StorefrontId } from '@darkpay/dark-types/substrate/interfaces'
import { Option } from '@polkadot/types'
import { AccountId } from '@polkadot/types/interfaces'
// import { addShopping } from './action'
import { useCart } from "react-use-cart";



type Props = {
  storefront: HasStorefrontIdOrHandle
  product: ProductData
  productdetails: ProductWithSomeDetails
  title?: string
  hint?: string
  className?: string
}

export const AddToCartWidget = ({
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


const ProductPrice = Number(productdetails.product.struct.price_usd)/100
// console.log('DEBUG PRICE **** '+productdetails.product.struct.price)

const BuyerEscrow = productdetails.product.content?.bescrow
const SellerEscrow = productdetails.product.content?.sescrow
// const ShipCost = Number(productdetails.product.struct.ship_cost)/100






const openNotification = (ProductTitle: string | undefined) => {
  notification.open({
    type: 'success',
    message: 'Item added to your cart',
    description:
    ProductTitle,
    onClick: () => {
      console.log('Add to cart Notification Clicked!');
    },
  });
};

const [ qty=1, setQty ] = useState<string | number | undefined>()

const onQtyChanged = (qty: string | number | undefined) => {
 // console.log('qty is ---> '+qty)
  setQty(qty)
}


  

  const data = {
            "id": (Number(ProductId)).toString(),
            "img": ProductImage,
            "name": ProductTitle,
            "price": ProductPrice,
            "sfId": ProductSf,
            "seller": ProductSeller,
            "bescrow" : BuyerEscrow,
            "sescrow": SellerEscrow,
        //    "shipcost": ShipCost,
}


  const addToCart = (data: { id: ProductId; img: string | undefined; name: string | undefined; qty: number; price: number; sfId: Option<StorefrontId>; seller: AccountId; bescrow: string | undefined; sescrow: string | undefined; shipcost: number ; shipsto: string | undefined }) => {
    console.log( addToCart)


    openNotification(data.name)


  }

  



  const { inCart, addItem } = useCart();
  const cartTitle = inCart((data.id).toString()) ? 'Add more' : 'Add to cart'

  return <>

  <div className="addtocart-price">
      <InputNumber
      name='qty'
      min={1} max={10} 
      defaultValue={1}
      step='1'
      prefix='Qty: '
      onChange={onQtyChanged} 
    />
  </div>
  <div className="addtocart-btn">
    <a
      className='ant-btn ant-btn-primary addtocart'
      onClick={() => isSignedIn ?  addItem(data, Number(qty)) : openSignInModal('AuthRequired')}
      title={cartTitle}
    >
      <IconWithLabel icon={<ShoppingCartOutlined />} label={cartTitle} />
      {/* <AddToCartTotal product={product} productPrice={Number(product.struct.price)} qty={qty}  /> */}
      {/* <TickerDarkUsd /> */}
    </a>
  </div>

  </>
}

export default AddToCartWidget


