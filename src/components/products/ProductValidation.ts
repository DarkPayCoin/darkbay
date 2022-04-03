import * as Yup from 'yup';
import { maxLenError, minLenError, urlValidation } from '../utils/forms/validation';
import { pluralize } from '../utils/Plularize';

const TITLE_MIN_LEN = 3;
const TITLE_MAX_LEN = 100;

const MAX_TAGS_PER_POST = 10

const POST_MAX_LEN = 10000;

export const buildValidationSchema = () => Yup.object().shape({
  title: Yup.string()
    // .required('Product title is required')
    .min(TITLE_MIN_LEN, minLenError('Product title', TITLE_MIN_LEN))
    .max(TITLE_MAX_LEN, maxLenError('Product title', TITLE_MAX_LEN)),

  body: Yup.string()
    .required('Product body is required')
    // .min(p.minTextLen.toNumber(), minLenError('Product body', p.productMinLen))
    .max(POST_MAX_LEN, maxLenError('Product body', POST_MAX_LEN)),

  image: urlValidation('Image'),

  tags: Yup.array()
    .max(MAX_TAGS_PER_POST, `Too many tags. You can use up to ${pluralize(MAX_TAGS_PER_POST, 'tag')} per product.`),

  canonical: urlValidation('Original product')
})

export const buildShareProductValidationSchema = () => Yup.object().shape({
  body: Yup.string()
    .max(POST_MAX_LEN, maxLenError('Product body', POST_MAX_LEN))
})
