import React, { useState } from 'react';
import { getDarkdotApi } from 'src/components/utils/DarkdotConnect';


import Section from '../utils/Section';


type TickerDarkUsdProps = {
  avgPrice?: number
}

export const TickerDarkUsd: React.FunctionComponent<TickerDarkUsdProps> = React.memo(() => {

  const [tickerDarkUsd, settickerDarkUsd] = useState<string | number | undefined>()

  const getAvgPrice = new Promise<number>(async (resolve, reject) => {
    const darkdot = await getDarkdotApi();
    const { substrate } = darkdot
    const prices = await substrate.getPrices()

    if (prices.length > 0) {
      var sum = 0;
      for (var i = 0; i < prices.length; i++) {
        sum += parseInt(prices[i], 10); //don't forget to add the base
      }

      const lastPrice = (sum / prices.length) / 100000;
      settickerDarkUsd(lastPrice)
      resolve(lastPrice)
      // return {
      //   lastPrice
      // }
    }
    else {
      reject('Zero or no data given by Offchain storage')
    }

  });


  function avgPrice() {
    getAvgPrice.then((price) => {
    settickerDarkUsd(price)
    console.log('******* NowgetAvgPrice : ' + price)
    return (price) // Succès !
  }, (err) => {
    console.log('******* NowgetAvgPrice ERROR: ' + err) // Erreur !
  })
}
  
avgPrice()

  return <Section className={`DfTickerDarkUsd`}>

    <h3>1 DARK = {tickerDarkUsd}</h3>
  </Section>
})







/////////////
export default TickerDarkUsd;