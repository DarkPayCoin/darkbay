import { Badge, notification } from "antd";
import React from "react";
import { useCart } from "react-use-cart";
import { resolveIpfsUrl } from "src/ipfs";
import CartPriceToDark from './CartPriceToDark';

type ShippingViewCartProps = {

}

export const ShippingViewCart = ({ }: ShippingViewCartProps) => {


    const {
        cartTotal,
        items,
        updateCartMetadata,
        removeItem    } = useCart();

    // Buyer escrow total
    const totalBescrow = items
    .filter((item) => item.quantity != undefined)
    .reduce(function(prev, cur) 
    {
         return (prev + ((cur.price * (cur.bescrow / 100) * cur.quantity!)) );
    }, 0); 
    // Shipping total
    const totalShipping = items
    .filter((item) => item.shipcost > 0)
    .reduce(function(prev, cur) 
    {
         return (prev + ((cur.shipcost * cur.quantity!)) );
    }, 0); 
    // Cart total
    const grandTotal = cartTotal + totalBescrow + totalShipping;

// Accepts the array and key
const groupBy = (array: any[], key: string) => {
    // Return the end result
    return array.reduce((result, currentValue) => {
      // If an array already present for key, push it to the array. Else create an array and push the object
      (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue
      );
      // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
      return result;
    }, {}); // empty object is the initial value for result object
  };
  



  const openNotification = (DiffSellers: number | undefined) => {
    notification.open({
      type: 'warning',
      message: 'As the automated escrow system proof of concept works, you can only order in one storefront at a time.',
      description:
      'You have ' + DiffSellers?.toString()+' different sellers, your cart will be split.',
      onClick: () => {
        console.log('Orders splitted from different storefronts!');
      },
    });
  };

  // Group by seller as key to the person array
  const cartGroupedBySeller = groupBy(items, 'seller');
  // Keep first group as main order to complete, keep others in cart
//  console.warn(cartGroupedBySeller)

//   for (const [key, value] of Object.entries(cartGroupedBySeller)) {
//     console.log(`${key}: ${value}`);
//   }




  if( Object.keys(cartGroupedBySeller).length > 1) {
    openNotification(Object.keys(cartGroupedBySeller).length)
    const objToArray = Object.values(cartGroupedBySeller);  //makes the array


    let constFirstCart : any = objToArray.shift()
    
    console.log(constFirstCart);

     updateCartMetadata({ for_later: objToArray });
    // console.log(objToArray[0]);

    for(var i = 0; i < objToArray.length; i++){
      if(objToArray[i] instanceof Array){
        let forLater : any = objToArray[i]
        forLater.forEach((entry: any) => {
          console.log(entry.id);
          removeItem(entry.id)
      });      }else{
          console.log(objToArray[i]);
      }
    }
  }
  


    // if empty cart
   // if (isEmpty) return <EmptyCart />

    // cart
    return (
        <>
    <div id="ShippingViewCart">

<div className="fullFlex">
            <table className='ant-table view-cart-table'>
                <thead className='ant-table-thead'>

                </thead>
                <tbody className='ant-table-tbody'>
                {items.map(item => (
                    <tr className='ant-table-row' key={item.id}>
                        <td className='ant-table-cell'>
                        <img src={resolveIpfsUrl(item.img)} className='DfCartImage' /* add onError handler */ />
                        <Badge count={item.quantity}>
                        </Badge>
                        </td>
                        <td className='ant-table-cell cart-cell cart-desc'>
                        <span className='cart-product-title'>{item.name}</span><br />
                        <span className='cart-product-escrow'>Escrow : {item.bescrow}%</span>
                        <br />

                        {/* <span className='cart-product-shipcost'>Shipping cost : {item.shipcost ? (item.shipcost.toFixed(2)).toLocaleString()+'$' : 'free'}</span> */}
                        {/* <br />
                        <span className='cart-product-seller'>Seller : {item.seller}</span> */}
                        </td>
                        <td className='ant-table-cell cart-cell'>
                        {(item.price.toFixed(2)).toLocaleString()}$
                        </td>
                        
                       
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
            
            <div className="fullFlex">
            <div className="shipping-cart-totals">
              <table className='ant-table shipping-view-cart-total'>
                <thead className='ant-table-thead'></thead>
                <tbody className='ant-table-tbody'>
                <tr>
                <td className='ant-table-cell cart-cell'>
                        Items total : 
                </td>
                <td className='ant-table-cell cart-cell'>
                $ {(cartTotal.toFixed(2)).toLocaleString()}
                </td>
                </tr>
                <tr>
                <td className='ant-table-cell cart-cell'>
                        Shipping  : 
                </td>
                <td className='ant-table-cell cart-cell'>
                $ {(totalShipping.toFixed(2)).toLocaleString()}
                </td>
                </tr>
                <tr>
                <td className='ant-table-cell cart-cell'>
                        Escrow  : 
                </td>
                <td className='ant-table-cell cart-cell'>
                $ {totalBescrow.toFixed(2).toLocaleString()}
                </td>
                </tr>
                <tr>
                <td className='ant-table-cell cart-cell'>
                        Order total : 
                </td>
                <td className='ant-table-cell cart-cell'>
                $ {(grandTotal.toFixed(2)).toLocaleString()}<br />
                        <CartPriceToDark price={grandTotal} />
                </td>
                </tr>
                </tbody>
              </table>
                   </div>
                
          
  
            </div></div>
     
        </>
    );
}

export default ShippingViewCart;

