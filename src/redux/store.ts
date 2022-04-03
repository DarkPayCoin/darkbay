import {
  configureStore,
  getDefaultMiddleware
} from '@reduxjs/toolkit'
import replyIdsByProductIdReducer from './slices/replyIdsByProductIdSlice';
import productByIdReducer from './slices/productByIdSlice';
// import  testSlice  from './slices/testSlice';

export default configureStore({
  reducer: {
    replyIdsByProductId: replyIdsByProductIdReducer,
    productById: productByIdReducer,
    //profileTest: testSlice,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false
  })
})
