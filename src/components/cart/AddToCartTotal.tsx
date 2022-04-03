import React, { useState } from 'react';
import { ProductData } from '@darkpay/dark-types/dto';
import { getDarkdotApi } from 'src/components/utils/DarkdotConnect';


import Section from '../utils/Section';


type AddToCartTotalProps = {
  product: ProductData,
  productPrice?: string | number | undefined,
  qty?: string | number | undefined,
  avgPrice?: number
}


export const AddToCartTotal: React.FunctionComponent<AddToCartTotalProps> = React.memo(({ product, qty }) => {

  
  const [usdPerDark, setusdPerDark] = useState<string | number | undefined>()

  const productPrice = Number(product.struct.price_usd)
  // 1 Dark to 1 USD from Offchain
  const getAvgPrice = new Promise<number>(async (resolve, reject) => {
    const darkdot = await getDarkdotApi();
   // const { substrate } = darkdot || await getDarkdotApi();
    const prices = await darkdot.substrate.getPrices();

    if (prices.length > 0) {
      var sum = 0;
      for (var i = 0; i < prices.length; i++) {
        sum += parseInt(prices[i], 10); //don't forget to add the base
      }

      const lastPrice = (sum / prices.length) / 100000;
      setusdPerDark(lastPrice)
      resolve(lastPrice)
    }
    else {
      reject('Zero or no data given by Offchain storage')
    }
  });


  getAvgPrice.then((price) => {
    setusdPerDark(price)
    console.log('******* NowgetAvgPrice : ' + price)
    return (price) // Success !
  }, (err) => {
    console.log('******* NowgetAvgPrice ERROR: ' + err) // Error !
  });


if (!qty) qty = 1

 const priceUsdX100 = productPrice/100
 const addToCartTotalUsd = priceUsdX100*(qty as any)
 const addToCartTotalDark = (addToCartTotalUsd/(usdPerDark as any)).toFixed(2)

  return <Section className={`DfTotalAddToCart`}>
  <h5 className="totalAddCart4Human ">{addToCartTotalUsd} USD / {addToCartTotalDark} DARK</h5>
    {/* <h3>{qty} X ${priceUsdX100}= {addToCartTotalUsd} USD / {addToCartTotalDark} DARK</h3> */}
  </Section>
})




/////////////
export default AddToCartTotal;