//import store from 'store2'
import React from 'react';
import { useCart } from "react-use-cart";





type CheckoutButtonTotalProps = {
    cartTotal?:  string | undefined
  }
  


  export const CheckoutButtonTotal = ({ }: CheckoutButtonTotalProps) => {

    const { isEmpty } = useCart();
    const { totalItems } = useCart();
    const { cartTotal } = useCart();
    const cartTotalRounded = cartTotal.toFixed(2)


  return <>
    {!isEmpty
      ? <>

<span>{totalItems}</span> items | <span>{cartTotalRounded} $</span>
      </>
      :
<span>Cart is empty</span>
}
  </>
}

export default CheckoutButtonTotal;



// export const productstoreKey = 'products'
// export const totalsstoreKey = 'totals'

// interface Options {
//     location?: {
//       x?: number;
//       y?: number;
//     };
//   }
//   function foo(options?: Options) {
//     if (options && options.location && options.location.x) {
//       const x = options.location.x; // Type of x is number
//     }
//   }


//     function checkCart () {
//     if(Cart) {
//       console.log('Cart structure exists.') 
//     }
//       else {
//     //Setting store key and data
//     store('Darkdot_Cart', {'products': [], 'totals':[]}); 
//     console.log('Cart structure created.')
//     }
        
//   }

//   function addToCart (data: any) {
//     Cart.add('products', data); 
//     console.log('Product : '+data['name']+' added to cart.')
//   }
  
//   function getCartTotal () : number | undefined { 
//     let cartTotal = 0
//     if(Cart.get('totals').length > 0) {
//         cartTotal = Cart.get('totals')
//     }
//     return cartTotal
//   }
  





//   export function maxLenError (fieldName: string, maxLen: number | BN): string {
//     return `${fieldName} is too long. Maximum length is ${pluralize(maxLen, 'char')}.`
//   }
  

// export { checkCart, addToCart, getCartTotal  }