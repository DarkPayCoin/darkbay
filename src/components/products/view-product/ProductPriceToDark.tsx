import React, { useState } from 'react';
import { ProductData } from '@darkpay/dark-types/dto';
import { getDarkdotApi } from 'src/components/utils/DarkdotConnect';


import Section from '../../utils/Section';


type ProductPriceToDarkProps = {
  product: ProductData,
  productPrice?: string | number | undefined,
  avgPrice?: number
}


export const ProductPriceToDark: React.FunctionComponent<ProductPriceToDarkProps> = React.memo(({ product }) => {

  
  const [usdPerDark, setusdPerDark] = useState<string | number | undefined>()

  const productPrice = Number(product.struct.price_usd)
  // 1 Dark to 1 USD from Offchain
  const getAvgPrice = new Promise<number>(async (resolve, reject) => {
    const darkdot = await getDarkdotApi();
    const { substrate } = darkdot;
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


  function avgPrice() { getAvgPrice.then((price) => {
    setusdPerDark(price)
    console.log('******* NowgetAvgPrice : ' + price)
    return (price) // Succès !
  }, (err) => {
    console.log('******* NowgetAvgPrice ERROR: ' + err) // Erreur !
  })
}

avgPrice()

 const priceUsdX100 = productPrice/100
 const ProductPriceToDarkDark = (priceUsdX100/(usdPerDark as any)).toFixed(2)

  return <Section className={`DfProductPriceToDark`}>
  <h5 className="ProductPriceToDark4Human ">{ProductPriceToDarkDark} ▼</h5>
    {/* <h3>{qty} X ${priceUsdX100}= {ProductPriceToDarkUsd} USD / {ProductPriceToDarkDark} DARK</h3> */}
  </Section>
})




/////////////
export default ProductPriceToDark;