
import { getAvgPricesOffchain } from '../substrate'



export const PriceConvert = (props: { productprice: any, qty: any, lastPrice: any }) => {
    console.log(props);//undefined
   // console.log(prices);//{}
   return null
  };
  
  
  PriceConvert.getInitialProps = async () => {

    const lastPrice = await getAvgPricesOffchain()

      return { qty: 1, lastPrice: lastPrice[0] };
  };



// import { NextPage } from 'next'

// interface Props {
//   qty?: number;
//   productprice?: number,
//   lastPrice?: number,
// }

// const getAvgPrice = new Promise<number>(async (resolve, reject) => {
//     const darkdot = await getDarkdotApi();
//     const { substrate } = darkdot
//     const prices = await substrate.getPrices()
    
  
//     if(prices.length > 0) {
//     var sum = 0;
//   for( var i = 0; i < prices.length; i++ ){
//       sum += parseInt( prices[i], 10 ); //don't forget to add the base
//   }
  
//   const lastPrice = (sum/prices.length)/100000;
  
//   resolve(lastPrice)
//     // return {
//     //   lastPrice
//     // }
//   }
//   else {
//   reject('Zero or no data given by Offchain storage')
//   }

// });


// export const PriceConvert: NextPage<Props> = ({ qty, productprice, lastPrice }) => (
//   <main>Qty: {qty} X USdPrice : {productprice} / 1 DARK = {lastPrice}</main>
// )

// PriceConvert.getInitialProps = async () => {
//   const qty = 1
//   var lastPrice = 0.10

// getAvgPrice.then((valeur) => {
//   console.log('******* NowgetAvgPrice : '+valeur)
//  var lastPrice = valeur
//  return { qty, lastPrice}
//   }, (raison) => {
//   console.log('******* NowgetAvgPrice ERROR: '+raison) // Erreur !
// });
// return { qty, lastPrice}


// }

export default PriceConvert


// type Props = {
//   product: ProductWithSomeDetails
//   qty?: number,
//   lastPrice?: number,
//   className?: string
// }

// export const PriceConvert = ({
//   product,
//   qty,
//   lastPrice,
//   className
// }: Props) => {

// const [ darkToUsd, setdarkToUsd ] = useState<string | number | undefined>()


// const getAvgPrice = new Promise<number>(async (resolve, reject) => {
//   const darkdot = await getDarkdotApi();
//   const { substrate } = darkdot
//   const prices = await substrate.getPrices()
  

//   if(prices.length > 0) {
//   var sum = 0;
// for( var i = 0; i < prices.length; i++ ){
//     sum += parseInt( prices[i], 10 ); //don't forget to add the base
// }

// const lastPrice = (sum/prices.length)/100000;
// setdarkToUsd(lastPrice)
// resolve(lastPrice)
//   // return {
//   //   lastPrice
//   // }
// }
// else {
// reject('Zero or no data given by Offchain storage')
// }

// });

//     const forqty = qty
//     const forprice = Number(product.product.struct.price)
//     const forlastprice = lastPrice
//  // if (!storefront.id || !product.id || !title) return null

//   return (


// <Segment>OK !!!! {forqty} X {forprice} / {forlastprice}</Segment>
//   )
// }

// export default PriceConvert