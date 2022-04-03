import { CommentsState } from './slices/replyIdsByProductIdSlice';
import { ProductState } from './slices/productByIdSlice';
// import { testState } from './slices/testSlice';
import { ProductWithAllDetails, ProductWithSomeDetails } from '@darkpay/dark-types';

export type Store = {
  replyIdsByProductId: CommentsState
  productById: ProductState
  // testSlice: testState
}

export type ProductsStoreType = ProductWithAllDetails | ProductWithSomeDetails | (ProductWithAllDetails | ProductWithSomeDetails)[]
