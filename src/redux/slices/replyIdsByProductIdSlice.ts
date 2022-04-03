import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { Store } from '../types'
import { ProductWithAllDetails } from '@darkpay/dark-types'

export type CommentsState = Record<string, string[]>

type ActionType<T> = {
  parentId: string,
  replyId: T
}

type ReducerSingleType = CaseReducer<CommentsState, PayloadAction<ActionType<string>>>
type ReducerType = CaseReducer<CommentsState, PayloadAction<ActionType<string | string[]>>>

export const addCommentReducer: ReducerType = (state, { payload: { replyId, parentId } }) => {
  const ids = Array.isArray(replyId)
    ? replyId
    : [ replyId ]

  let currentReplyIds: string[] | undefined = state[parentId]

  if (currentReplyIds) {
    currentReplyIds.push(...ids)
    currentReplyIds = [ ...(new Set(currentReplyIds)) ]
  } else {
    currentReplyIds = ids
  }

  state[parentId] = currentReplyIds
}

export const editCommentReducer: ReducerSingleType = (state, { payload: { replyId, parentId } }) => {
  const productIdStr = parentId.toString()
  let currentComments: string[] | undefined = state[productIdStr]

  const replyIdStr = replyId.toString()

  if (currentComments) {
    currentComments = currentComments.map(item =>
      item === replyIdStr ? replyIdStr : item)
  } else {
    currentComments = [ replyIdStr ]
  }

  state[productIdStr] = currentComments
}

export const removeCommentReducer: ReducerSingleType = (state, { payload: { replyId, parentId } }) => {

  const productIdStr = parentId.toString()
  let currentComments: string[] | undefined = state[productIdStr]

  const replyIdStr = replyId.toString()

  if (currentComments) {
    currentComments = currentComments.filter(item =>
      item !== replyIdStr)
    state[productIdStr] = [ ...currentComments ]
  }

}

export const commentSlice = createSlice({
  name: 'replyIdsByProductId',
  initialState: {} as CommentsState,
  reducers: {
    addCommentReducer,
    editCommentReducer,
    removeCommentReducer
  }
})

export const getComments = (store: Store, parentId: string): ProductWithAllDetails[] => {
  const { replyIdsByProductId, productById } = store
  const commentIds = replyIdsByProductId[parentId]
  const res = commentIds && productById
    ? commentIds
      .map(x => {
        return productById[x]
      })
      .filter(x => x !== undefined)
    : []
  return res
}

export const getCommentsStore = (state: Store) => state.replyIdsByProductId

export const {
  addCommentReducer: addComments,
  editCommentReducer: editComment,
  removeCommentReducer: removeComment
} = commentSlice.actions

export default commentSlice.reducer
