import React, { useState } from 'react'
import { Form, Input, Select } from 'antd'
import Router from 'next/router'
import BN from 'bn.js'
import HeadMeta from '../utils/HeadMeta'
import Section from '../utils/Section'
import { getNewIdFromEvent, equalAddresses, stringifyText, getTxParams } from '../substrate'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { StorefrontUpdate, OptionBool, OptionIpfsContent, OptionOptionText, OptionText, OptionId, IpfsContent } from '@darkpay/dark-types/substrate/classes'
import { IpfsCid } from '@darkpay/dark-types/substrate/interfaces'
import { StorefrontContent } from '@darkpay/dark-types'
import { newLogger, isEmptyStr } from '@darkpay/dark-utils'
import { useDarkdotApi } from '../utils/DarkdotApiContext'
import { useMyAddress } from '../auth/MyAccountContext'
import { DfForm, DfFormButtons, minLenError, maxLenError } from '../forms'
import NoData from '../utils/EmptyList'
import DfMdEditor from '../utils/DfMdEditor'
import { withLoadStorefrontFromUrl, CheckStorefrontPermissionFn, CanHaveStorefrontProps } from './withLoadStorefrontFromUrl'
import { NAME_MIN_LEN, NAME_MAX_LEN, DESC_MAX_LEN, MIN_HANDLE_LEN, MAX_HANDLE_LEN } from 'src/config/ValidationsConfig'
import { NewSocialLinks } from './SocialLinks/NewSocialLinks'
import { UploadCover } from '../uploader'
import { MailOutlined } from '@ant-design/icons'
import { DarkdotSubstrateApi } from '@darkpay/dark-api/api/substrate'
import { resolveCidOfContent } from '@darkpay/dark-api/utils'
import { getNonEmptyStorefrontContent } from '../utils/content'
import messages from 'src/messages'
import { Option } from '@polkadot/types'
import registry from '@darkpay/dark-types/substrate/registry'

const log = newLogger('EditStorefront')

const MAX_TAGS = 10

type Content = StorefrontContent

type FormValues = Partial<Content & {
  handle: string,

}>

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

type ValidationProps = {
  minHandleLen: number
  maxHandleLen: number
}

type FormProps = CanHaveStorefrontProps & ValidationProps

function getInitialValues ({ storefront }: FormProps): FormValues {
  if (storefront) {
    const { struct, content } = storefront
    const handle = stringifyText<string>(struct.handle)
    return { ...content, handle }
  }
  return {}
}

const isHandleUnique = async (substrate: DarkdotSubstrateApi, handle: string, myStorefrontId?: BN) => {
  if (isEmptyStr(handle)) return true

  const storefrontIdByHandle = await substrate.getStorefrontIdByHandle(handle.trim().toLowerCase())

  if (!storefrontIdByHandle) return true

  if (myStorefrontId) return storefrontIdByHandle.eq(myStorefrontId)

  return !storefrontIdByHandle

}

export function InnerForm (props: FormProps) {
  const [ form ] = Form.useForm()
  const { ipfs, substrate } = useDarkdotApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>()

  const { storefront, minHandleLen, maxHandleLen } = props

  const initialValues = getInitialValues(props)
  const tags = initialValues.tags || []

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const newTxParams = (cid: IpfsCid) => {
    const fieldValues = getFieldValues()

    /** Returns `undefined` if value hasn't been changed. */
    function getValueIfChanged (field: FieldName): any | undefined {
      return form.isFieldTouched(field) ? fieldValues[field] as any : undefined
    }

    /** Returns `undefined` if CID hasn't been changed. */
    function getCidIfChanged (): IpfsCid | undefined {
      const prevCid = resolveCidOfContent(storefront?.struct?.content)
      return prevCid !== cid.toString() ? cid : undefined
    }

    if (!storefront) {
      return [ new OptionId(), new OptionText(fieldValues.handle), new IpfsContent(cid), new Option(registry, 'StorefrontPermissions') ]
    } else {
      // Update only dirty values.

      // TODO seems like we cannot set a handle to None.

      // TODO update StorefrontUpdate class
      const update = new StorefrontUpdate({
        parent_id: new Option(registry, 'StorefrontId'),
        handle: new OptionOptionText(getValueIfChanged('handle')),
        content: new OptionIpfsContent(getCidIfChanged()),
        hidden: new OptionBool(),
        permissions: new Option(registry, 'StorefrontPermissions')
      })
      return [ storefront.struct.id, update ]
    }
  }

  const fieldValuesToContent = (): Content =>
    getNonEmptyStorefrontContent(getFieldValues() as Content)

  // TODO pin to IPFS only if JSON changed.
  const pinToIpfsAndBuildTxParams = () => getTxParams({
    json: fieldValuesToContent(),
    buildTxParamsCallback: newTxParams,
    setIpfsCid,
    ipfs
  })

  const onFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch((err: string | undefined) => new Error(err))
  }

  const onSuccess: TxCallback = (txResult) => {
    const id = storefront?.struct.id || getNewIdFromEvent(txResult)
    id && goToView(id)
  }

  const goToView = (storefrontId: BN) => {
    Router.push('/[storefrontId]', `/${storefrontId}`)
      .catch(err => log.error(`Failed to redirect to a storefront page. ${err}`))
  }

  const onDescChanged = (mdText: string) => {
    form.setFieldsValue({ [fieldName('about')]: mdText })
  }

  const onAvatarChanged = (url?: string) => {
    form.setFieldsValue({ [fieldName('image')]: url })
  }



  const links = initialValues.links



  // Returns the form
  return <>
    <DfForm form={form} validateTrigger={[ 'onBlur' ]} initialValues={initialValues}>
      <Form.Item
        name={fieldName('image')}
        label='Storefront Banner'
        help={messages.imageShouldBeLessThanTwoMB}
      >
        <UploadCover onChange={onAvatarChanged} img={initialValues.image} />
      </Form.Item>

      <Form.Item
        name={fieldName('name')}
        label='Storefront name'
        hasFeedback
        rules={[
          { required: true, message: 'Name is required.' },
          { min: NAME_MIN_LEN, message: minLenError('Name', NAME_MIN_LEN) },
          { max: NAME_MAX_LEN, message: maxLenError('Name', NAME_MAX_LEN) }
        ]}
      >
        <Input placeholder='Name of your storefront' />
      </Form.Item>

      <Form.Item
        name={fieldName('handle')}
        label='Handle'
        help='This should be a unique handle that will be used in a URL of your storefront'
        hasFeedback
        rules={[
          { pattern: /^[A-Za-z0-9_]+$/, message: 'Handle can have only letters (a-z, A-Z), numbers (0-9) and underscores (_).' },
          { min: minHandleLen, message: minLenError('Handle', minHandleLen) },
          { max: maxHandleLen, message: maxLenError('Handle', maxHandleLen) },
          ({ getFieldValue }) => ({
            async validator () {
              const handle = getFieldValue(fieldName('handle'))
              const isUnique = await isHandleUnique(substrate, handle, storefront?.struct.id)
              if (isUnique) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('This handle is already taken. Please choose another.'));
            }
          })
        ]}
      >
        <Input placeholder='You can use a-z, 0-9 and underscores' />
      </Form.Item>

      <Form.Item
        name={fieldName('about')}
        label='Description'
        hasFeedback
        rules={[
          { max: DESC_MAX_LEN, message: maxLenError('Description', DESC_MAX_LEN) }
        ]}
      >
        <DfMdEditor onChange={onDescChanged} />
      </Form.Item>

      <Form.Item
        name={fieldName('tags')}
        label='Tags'
        hasFeedback
        rules={[
          { type: 'array', max: MAX_TAGS, message: `You can use up to ${MAX_TAGS} tags.` }
        ]}
      >
        <Select
          mode='tags'
          placeholder="Press 'Enter' or 'Tab' key to add tags"
        >
          {tags.map((tag, i) =>
            <Select.Option key={i} value={tag}>{tag}</Select.Option>
          )}
        </Select>
      </Form.Item>

      <Form.Item
        name={fieldName('email')}
        label={<span><MailOutlined /> Email address</span>}
        rules={[
          { pattern: /\S+@\S+\.\S+/, message: 'Should be a valid email' }
        ]}>
        <Input type='email' placeholder='Email address' />
      </Form.Item>

      


      <NewSocialLinks name='links' links={links} collapsed={!links} />

      <DfFormButtons
        form={form}
        txProps={{
          label: storefront
            ? 'Update storefront'
            : 'Create new storefront',
          tx: storefront
            ? 'storefronts.updateStorefront'
            : 'storefronts.createStorefront',
          params: pinToIpfsAndBuildTxParams,
          onSuccess,
          onFailed
        }}
      />
    </DfForm>
  </>
}

// function bnToNum (bn: Codec, _default: number): number {
//   return bn ? (bn as unknown as BN).toNumber() : _default
// }

export function FormInSection (props: Partial<FormProps>) {
  const [ consts ] = useState<ValidationProps>({
    minHandleLen: MIN_HANDLE_LEN, // bnToNum(api.consts.storefronts.minHandleLen, 5),
    maxHandleLen: MAX_HANDLE_LEN // bnToNum(api.consts.storefronts.maxHandleLen, 50)
  })
  const { storefront } = props
  const title = storefront ? `Edit storefront` : `New storefront`

  // useDarkdotEffect(({ substrate }) => {
  //   const load = async () => {
  //     // const api = await substrate.api
  //     setConsts({
  //       minHandleLen: MIN_HANDLE_LEN, // bnToNum(api.consts.storefronts.minHandleLen, 5),
  //       maxHandleLen: MAX_HANDLE_LEN // bnToNum(api.consts.storefronts.maxHandleLen, 50)
  //     })
  //   }
  //   load()
  // }, [])

  return <>
    <HeadMeta title={title} />
    <div className='EditEntityPage'>
      <h1 className="PageTitle">{title}</h1>
      <InnerForm {...props} {...consts} />
    </div>
  </>
}

const CannotEditStorefront = <NoData description='You do not have permission to edit this storefront' />

const LoadStorefrontThenEdit = withLoadStorefrontFromUrl(FormInSection)

export function EditStorefront (props: FormProps) {
  const myAddress = useMyAddress()

  const checkStorefrontPermission: CheckStorefrontPermissionFn = storefront => {
    const isOwner = storefront && equalAddresses(myAddress, storefront.struct.owner)
    return {
      ok: isOwner,
      error: () => CannotEditStorefront
    }
  }

  return <LoadStorefrontThenEdit {...props} checkStorefrontPermission={checkStorefrontPermission} />
}

export const NewStorefront = FormInSection

export default NewStorefront
