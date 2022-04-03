import React, { useState } from 'react';
import { getDarkdotApi } from 'src/components/utils/DarkdotConnect';


import Section from '../utils/Section';


type CartPriceToDarkProps = {
  price: number,
  avgPrice?: number
}


export const CartPriceToDark: React.FunctionComponent<CartPriceToDarkProps> = React.memo(({ price }) => {

  
  const [usdPerDark, setusdPerDark] = useState<string | number | undefined>()

  
  // 1 Dark to 1 USD from Offchain
  const getAvgPrice = new Promise<number>(async (resolve, reject) => {
    const darkdot = await getDarkdotApi();
    const { substrate } = darkdot || await getDarkdotApi();
    const prices = await substrate.getPrices();

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

  function getavgPrice() { getAvgPrice.then((price) => {
    setusdPerDark(price)
    console.log('******* NowgetAvgPrice : ' + price)
    return (price) // Succès !
  }, (err) => {
    console.log('******* NowgetAvgPrice ERROR: ' + err) // Erreur !
  })
}
  // const avgPrice = getAvgPrice.then((price) => {
  //   setusdPerDark(price)
  //   console.log('******* NowgetAvgPrice : ' + price)
  //   return (price) // Succès !
  // }, (err) => {
  //   console.log('******* NowgetAvgPrice ERROR: ' + err) // Erreur !
  // });

  getavgPrice()
  
 const CartPriceToDarkDark = (price/(usdPerDark as any)).toFixed(2)

  return <Section className={`DfCartPriceToDark`}>
  <h5 className="CartPriceToDark4Human ">{CartPriceToDarkDark} DARK</h5>
    {/* <h3>{qty} X ${priceUsdX100}= {CartPriceToDarkUsd} USD / {CartPriceToDarkDark} DARK</h3> */}
  </Section>
})




/////////////
export default CartPriceToDark;