import { ProductWithSomeDetails } from '@darkpay/dark-types/dto';
import { AnyAccountId } from '@darkpay/dark-types/substrate';
import { ProductId } from '@darkpay/dark-types/substrate/interfaces';
import { useState } from 'react';
import useDarkdotEffect from 'src/components/api/useDarkdotEffect';
import { isMyAddress } from 'src/components/auth/MyAccountContext';

type Props = {
  owner: AnyAccountId
  productIds: ProductId[]
}

export const useLoadUnlistedProductsByOwner = ({ owner, productIds }: Props) => {
  const isMyStorefronts = isMyAddress(owner)
  const [ myHiddenProducts, setMyHiddenProducts ] = useState<ProductWithSomeDetails[]>()

  useDarkdotEffect(({ darkdot }) => {
    if (!isMyStorefronts) return setMyHiddenProducts([])

    darkdot.findUnlistedProductsWithAllDetails(productIds)
      .then(setMyHiddenProducts)

  }, [ productIds.length, isMyStorefronts ])

  return {
    isLoading: !myHiddenProducts,
    myHiddenProducts: myHiddenProducts || []
  }
}
