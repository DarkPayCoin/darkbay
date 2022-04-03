import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { ProductData, ProductWithSomeDetails } from '@darkpay/dark-types'
import { Store, ProductsStoreType } from '../types'
import { Profile, Storefront } from '@darkpay/dark-types/substrate/interfaces'

export type ProductState = Record<string, any>

type AddActionType = {
  products: ProductsStoreType,
}

type AddReducerType = CaseReducer<ProductState, PayloadAction<AddActionType>>

const serialize = (object?: any) => object ? JSON.parse(JSON.stringify(object)) : undefined

const serializeProductWithExt = (item: ProductWithSomeDetails): ProductWithSomeDetails => {
  // eslint-disable-next-line prefer-const
  let { product, ext, owner, storefront } = item

  if (owner) {
    let profile = owner.profile
    profile = { ...profile, content: serialize(profile?.content) } as Profile
    owner = { ...owner, profile }
  }

  if (storefront) {
    const struct = storefront.struct
    storefront.struct = { ...struct, content: serialize(struct.content) } as Storefront
  }

  return {
    owner,
    storefront,
    product: serializeProduct(product),
    ext: ext ? serializeProductWithExt(ext) : undefined
  }
}

const serializeProduct = ({ struct, content }: ProductData): ProductData => {
  return {
    struct: { ...struct, extension: serialize(struct.extension), content: serialize(struct.content) },
    content
  } as ProductData
}

export const addProductReducer: AddReducerType = (state, { payload: { products } }) => {
  const productByIdData = Array.isArray(products) ? products : [ products ]

  productByIdData.forEach(x => {
    const id = x.product.struct.id.toString()
    state[id] = serializeProductWithExt(x)
  })
}

export type EditActionType = {
  productId: string,
  product: ProductData
}

type EditReducerType = CaseReducer<ProductState, PayloadAction<EditActionType>>

export const editProductReducer: EditReducerType = (state, { payload: { productId, product } }) => {
  let oldProduct: ProductWithSomeDetails | undefined = state[productId]

  if (!oldProduct) {
    oldProduct = { product }
  }
  oldProduct = { ...oldProduct, product }

  state[productId] = oldProduct
}

type DeleteActionType = {
  productId: string
}

type DeleteReducerType = CaseReducer<ProductState, PayloadAction<DeleteActionType>>

export const removeProductReducer: DeleteReducerType = (state, { payload: { productId } }) => {
  delete state[productId]
}

export const productSlice = createSlice({
  name: 'productById',
  initialState: { } as ProductState,
  reducers: {
    addProductReducer,
    editProductReducer,
    removeProductReducer
  }
})

export const getProduct = (state: Store) => state.productById

export const {
  addProductReducer: addProduct,
  editProductReducer: editProduct,
  removeProductReducer: removeProduct
} = productSlice.actions

export default productSlice.reducer
