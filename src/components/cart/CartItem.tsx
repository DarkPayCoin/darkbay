import React from 'react';
import {  PlusCircleOutlined, MinusCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import { useCart } from "react-use-cart";
import { resolveIpfsUrl } from 'src/ipfs';


// import { formatNumber } from '../../helpers/utils';

type ViewCartProps = {
item?: any
}

export const CartItem = ({ item }: ViewCartProps) => {
    const {
        updateItemQuantity,
        removeItem,
    } = useCart();

 //   function gotImg(string) {  return resolveIpfsUrl(item.img) }
 let  gotImg: (itemImg: string) => string = function (
    itemImg: string
  ): string {
    return resolveIpfsUrl(item.img)
  };
  

    return ( 
        <div className="row no-gutters py-2">
            <div className="col-sm-2 p-2">
           {gotImg(item.img)}

            </div>
            <div className="col-sm-4 p-2">
                <h5 className="mb-1">{item.name}</h5>
                <p className="mb-1">Price: {item.price} / Escrow: {item.bescrow}%</p>
                
            </div>
            <div className="col-sm-2 p-2 text-center ">
                 <p className="mb-0">Qty: {item.quantity}</p>
            </div>
            <div className="col-sm-4 p-2 text-right">
   
                 {
                     item.quantity > 1 &&
                     <button
                     onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                    className="btn btn-danger btn-sm mb-1">
                        <MinusCircleOutlined width={"20px"}/>
                    </button>
                 }
                               <button 
                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                 className="btn btn-primary btn-sm mr-2 mb-1">
                     <PlusCircleOutlined width={"20px"}/>
                 </button>


                {
                     item.quantity === 1 &&
                     <button
                    onClick={() => removeItem(item)}
                    className="btn btn-danger btn-sm mb-1">
                        <DeleteOutlined width={"20px"}/>
                    </button>
                 }
                 
            </div>
        </div>
    );
}

export default CartItem;