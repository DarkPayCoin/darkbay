import React from 'react';
import { HiddenProductAlert } from 'src/components/products/view-product';
import { DfMd } from 'src/components/utils/DfMd';
import { CommentData } from '@darkpay/dark-types/dto'
import styles from './index.module.sass'
import { HasProductId } from 'src/components/urls';

type CommentBodyProps = {
  comment: CommentData
}

export const CommentBody = ({ comment: { struct, content } }: CommentBodyProps) => {
  return <div className={styles.BumbleContent}>
    <HiddenProductAlert product={struct} className={styles.DfCommentAlert} preview />
    <DfMd source={content?.body} />
  </div>
}

const FAKE = 'fake'

export const isFakeId = (comment: HasProductId) => comment.id.toString().startsWith(FAKE)
