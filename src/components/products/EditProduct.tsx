import React, { useState } from 'react'
import { Button, Collapse, Divider, Form, InputNumber, Select, Slider, Space, Tabs } from 'antd'
import Router, { useRouter } from 'next/router'
import BN from 'bn.js'
import HeadMeta from '../utils/HeadMeta'
import { getNewIdFromEvent, equalAddresses, getTxParams } from '../substrate'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { ProductExtension, ProductUpdate, OptionId, OptionBool, OptionIpfsContent, IpfsContent, OptionPrice} from '@darkpay/dark-types/substrate/classes'
import { IpfsCid } from '@darkpay/dark-types/substrate/interfaces'
import { ProductContent, ProductData, ProductExt } from '@darkpay/dark-types'
import { registry } from '@darkpay/dark-types/substrate/registry'
import { newLogger } from '@darkpay/dark-utils'
import { useDarkdotApi } from '../utils/DarkdotApiContext'
import useDarkdotEffect from '../api/useDarkdotEffect'
import { useMyAddress } from '../auth/MyAccountContext'
import { DfForm, DfFormButtons, minLenError, maxLenError } from '../forms'
import { Loading } from '../utils'
import NoData from '../utils/EmptyList'
import { i32, Null } from '@polkadot/types'
import DfMdEditor from '../utils/DfMdEditor/client'
import StorefrontgedSectionTitle from '../storefronts/StorefrontdSectionTitle'
import { withLoadStorefrontFromUrl, CanHaveStorefrontProps } from '../storefronts/withLoadStorefrontFromUrl'
import { UploadCover } from '../uploader'
import { getNonEmptyProductContent } from '../utils/content'
import messages from 'src/messages'
import { PageContent } from '../main/PageWrapper'
// import { useKusamaContext } from '../kusama/KusamaContext'
import Input from 'antd/lib/input/Input'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
// import { KusamaProposalForm } from '../kusama/KusamaEditProduct'

const { TabPane } = Tabs

const log = newLogger('EditProduct')

const TITLE_MIN_LEN = 3
const TITLE_MAX_LEN = 100

const BODY_MAX_LEN = 100_000 // ~100k chars

const MAX_TAGS = 10

type Content = ProductContent

type FormValues = Partial<Content & {
  storefrontId: string,
  proposalIndex?: number
  price?: number
  bescrow?: number
  sescrow?: number
  taxpct?: number
  discountpct?: number
  // shipzones?: string
}>

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

export type ProductFormProps = CanHaveStorefrontProps & {
  product?: ProductData
  /** Storefronts where you can product. */
  storefrontIds?: BN[],
  ext?: ProductExt
}

export function getInitialValues ({ storefront, product }: ProductFormProps): FormValues {
  if (storefront && product) {
    const storefrontId = storefront.struct.id.toString()
    return { ...product.content, storefrontId }
  }
  return {}
}

const RegularProductExt = new ProductExtension({ RegularProduct: new Null(registry) })

export function ProductForm (props: ProductFormProps) {
  const { storefront, product, ext } = props
  const [ form ] = Form.useForm()
  const { ipfs } = useDarkdotApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>()
  const [ price, setPrice ] = useState<i32 | number | undefined>()
  const [ bescrow, setBescrow ] = useState<i32 | number | undefined>()
  const [ sescrow, setSescrow ] = useState<i32 | number | undefined>()
  const [ taxpct, setTaxpct ] = useState<i32 | number |undefined>()
  const [ discountpct, setDiscountpct ] = useState<i32 | number | undefined>()

  if (!storefront) return <NoData description='Storefront not found' />

  const storefrontId = storefront.struct.id
  const initialValues = getInitialValues(props)

  const tags = initialValues.tags || []
  const orig_price = Number(props.product?.struct.price_usd) || 0
  const orig_bescrow =  Number(props.product?.struct.buyer_esc_pct)/100 || 50
  const orig_sescrow =  Number(props.product?.struct.seller_esc_pct)/100 || 50
  const orig_taxpct =   Number(props.product?.struct.tax_pct)/100 || 0
  const orig_discountpct =   Number(props.product?.struct.discount_pct)/100 || 0
//  const shipzones = initialValues.shipzones || []
  //const orig_variations = initialValues.variations || []

// alert('ORIG : ' + orig_price);

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const newTxParams = (cid: IpfsCid) => {
    if (!product) {
      //console.log(form.getFieldValue([fieldName('price')]))
      //   price_usd: Option<i32>,
        // tax_pct: Option<i32>,
        // discount_pct: Option<i32>,
        // buyer_esc_pct: Option<i32>,
        // seller_esc_pct: Option<i32>,
      // If creating a new product.
      return [ storefrontId, RegularProductExt, new IpfsContent(cid), Number(price)*100, Number(taxpct)*100, Number(discountpct)*100, Number(bescrow)*100, Number(sescrow)*100]
    } else {
    
      // TODO Update only changed values.
 //     alert('NEW: ' + price)
      const update = new ProductUpdate({
        // If we provide a new storefront_id in update, it will move this product to another storefront.
        storefront_id: new OptionId(),
        content: new OptionIpfsContent(cid),
        price_usd: new OptionPrice(convertPrice(price)),
        tax_pct: new OptionPrice(convertPrice(taxpct)),
        discount_pct: new OptionPrice(convertPrice(discountpct)),
        buyer_esc_pct: new OptionPrice(convertPrice(bescrow)),
        seller_esc_pct: new OptionPrice(convertPrice(sescrow)),
        hidden: new OptionBool(false), // TODO has no implementation on UI
      })

      return [ product.struct.id, update ]
    }
  }


  const convertPrice = (price: any): any => {
//    alert('CONV > '+price)
    return (price * 100);
  };

  const fieldValuesToContent = (): Content =>
    getNonEmptyProductContent({ ...getFieldValues(), ext } as Content)

  const pinToIpfsAndBuildTxParams = () => {

    // TODO pin to IPFS only if JSON changed.

    return getTxParams({
      json: fieldValuesToContent(),
      buildTxParamsCallback: newTxParams,
      setIpfsCid,
      ipfs
    })
  }

  const onFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch(err => new Error(err))
  }

  const onSuccess: TxCallback = (txResult) => {
    const id = product?.struct.id || getNewIdFromEvent(txResult)
    id && goToView(id)
  }

  const goToView = (productId: BN) => {
    Router.push('/[storefrontId]/products/[productId]', `/${storefrontId}/products/${productId}`)
      .catch(err => log.error(`Failed to redirect to a product page. ${err}`))
  }

  const onBodyChanged = (mdText: string) => {
    form.setFieldsValue({ [fieldName('body')]: mdText })
  }

  const onAvatarChanged = (url?: string) => {
    form.setFieldsValue({ [fieldName('image')]: url })
  }


  const onPriceChanged = (price: string | number | undefined) => {
    form.setFieldsValue({ [fieldName('price')]: price })
    console.log('Price is ---> '+price)
    setPrice(Number(price))
  }

  const onBescrowChanged = (bescrow: string | number | undefined) => {
    form.setFieldsValue({ [fieldName('bescrow')]: bescrow })
    setBescrow(Number(bescrow))
  }

  const onSescrowChanged = (sescrow: string | number | undefined) => {
    form.setFieldsValue({ [fieldName('sescrow')]: sescrow })
    setSescrow(Number(sescrow))
  }


  
  const onTaxpctChanged = (taxpct: string | number | undefined) => {
    form.setFieldsValue({ [fieldName('taxpct')]: taxpct })
    setTaxpct(Number(taxpct))
  }

  const onDiscountpctChanged = (discountpct: string | number | undefined) => {
    form.setFieldsValue({ [fieldName('discountpct')]: taxpct })
    setDiscountpct(Number(discountpct))
  }

  const { Panel } = Collapse;


  // Shipping Zones implementation tests
  //This is the order that already exists
const default_product_zones = {
  shipzones: [
    {
      zone_name: "Worldwide - Unique shipping cost",
      zone_countries: ["All"],
      zone_shipping_cost: "10",
    },
    {
      zone_name: "Europe",
      zone_countries: ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden"],
      zone_shipping_cost: "3.99",
    }
  ]
};

  //Create form fields based off how many items are in the order
  const productZones = default_product_zones.shipzones.map((zone) => {
    return {
      zone_name: zone.zone_name,
      zone_countries: zone.zone_countries,
      zone_shipping_cost: zone.zone_shipping_cost,
    };
  });

  return <>
    <DfForm form={form} initialValues={initialValues}>
      <Form.Item
        name={fieldName('title')}
        label='Product title'
        hasFeedback
        rules={[
           { required: true, message: 'Product title is required.' },
          { min: TITLE_MIN_LEN, message: minLenError('Product title', TITLE_MIN_LEN) },
          { max: TITLE_MAX_LEN, message: maxLenError('Product title', TITLE_MAX_LEN) }
        ]}
      >
        <Input placeholder='A short title for your product' />
      </Form.Item>

      <Form.Item
      label='Price (USD)'
      name={fieldName('price')}
      hasFeedback
      rules={[
        { required: true, message: 'Product price is required.' },
      ]}
      >
      <InputNumber
      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      defaultValue={orig_price/100}
      step='0.01'
      style={{
        width: 200,
      }}
      onChange = {onPriceChanged}
    />
    </Form.Item>

      <Form.Item
        name={fieldName('image')}
        label='Product Image'
        help={messages.imageShouldBeLessThanTwoMB}
      >
        <UploadCover onChange={onAvatarChanged} img={initialValues.image} />
      </Form.Item>

      <Form.Item
        name={fieldName('body')}
        label='Product Description'
        hasFeedback
        rules={[
          { required: true, message: 'Product description is required.' },
          { max: BODY_MAX_LEN, message: maxLenError('Product body', BODY_MAX_LEN) }
        ]}
      >
        <DfMdEditor onChange={onBodyChanged} />
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
            <Select.Option key={i} value={tag} >{tag}</Select.Option>
          )}
        </Select>
      </Form.Item>


      <Form.Item
      name={fieldName('bescrow')}
      label='Escrow % for Buyer'
      >
      <Slider
            min={30}
            max={70}
            defaultValue={Number(orig_bescrow)}
            onChange={onBescrowChanged}
          />
      </Form.Item>

      <Form.Item
      name={fieldName('sescrow')}
      label='Escrow % for You'
      >
      <Slider
            min={30}
            max={70}
            defaultValue={Number(orig_sescrow)}
            onChange={onSescrowChanged}
          />
      </Form.Item>

      <Form.Item
      label='Tax %'
      >
      <InputNumber
      name={fieldName('taxpct')}
      formatter={value => `% ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      defaultValue={orig_taxpct}
      step='0.01'
      style={{
        width: 200,
      }}
      onChange = {onTaxpctChanged}
    />
      </Form.Item>

      <Form.Item
      label='Discount %'
      >
      <InputNumber
      name={fieldName('discountpct')}
      formatter={value => `% ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      defaultValue={orig_discountpct}
      step='0.01'
      style={{
        width: 200,
      }}
      onChange = {onDiscountpctChanged}
    />
      </Form.Item>



      <Form.Item
        name={fieldName('canonical')}
        label='External URL'
        help='If you run a regular website which shows the product, you may enter its link here.'
        hasFeedback
        rules={[
          { type: 'url', message: 'Should be a valid URL.' }
        ]}
      >
        <Input type='url' placeholder='URL of the external product page' />
      </Form.Item>

    <Collapse accordion>
       <Panel header="Shipping zones" key="1">

       <div className="formDesc">You can use and modify predefined zones or remove them and add your own shipping zones.</div>

<Form.List name="Shiping zones" initialValue={productZones}>
  {(fields, { add, remove }) => (
    <>
      {fields.map((field) => (
        <Space
          key={field.key}
          style={{ display: "flex", marginBottom: 16 }}
          align="baseline"
        >

          <Form.Item
            {...field}
            name={[field.name, "zone_name"]}
            label='Zone name'
            labelCol={{ span: 24 }}

          >
            <Input placeholder="Shipping Zone" />
          </Form.Item>

          <Form.Item
            {...field}
            name={[field.name, "zone_shipping_cost"]}
            label='Shipping cost'
            labelCol={{ span: 24 }}
          >
            <Input placeholder="Zone Shipping cost" />
          </Form.Item>



          <Form.Item
            {...field}
            name={[field.name, "zone_countries"]}
            label='Shipping countries'
            labelCol={{ span: 24 }}
            hasFeedback
            rules={[
              { type: 'array' }
            ]}
          >

        <Select
          mode='tags'
          placeholder="Press 'Enter' or 'Tab' key to add countries"
        >
          {productZones.map((zone_countries, i) =>
            <Select.Option key={i} value={zone_countries} >{zone_countries}</Select.Option>
          )}
        </Select>
          </Form.Item>

         
          <MinusCircleOutlined onClick={() => remove(field.name)} /> 
          <Divider></Divider>
        </Space>
        
      ))}

      <Form.Item>

      <Divider></Divider>

        <Button
          type="dashed"
          onClick={() => add()}
          block
          icon={<PlusOutlined />}
        >
          Add custom shipping zone
        </Button>
      </Form.Item>
    </>
  )}
</Form.List>

       </Panel>
    </Collapse>



      {/* // TODO impl Move product to another storefront. See component SelectStorefrontPreview */}

      <DfFormButtons
        form={form}
        txProps={{
          label: product
            ? 'Update product'
            : 'Create product',
          tx: product
            ? 'products.updateProduct'
            : 'products.createProduct',
          params: pinToIpfsAndBuildTxParams,
          onSuccess,
          onFailed
        }}
      />
    </DfForm>
  </>
}

export const ProductForms = (props: ProductFormProps) => {
  const { product } = props

  const defaultKey = (product?.content as any)?.proposal
    ? 'proposal'
    : 'regular'

  return <Tabs className='mb-0' defaultActiveKey={defaultKey}>
    <TabPane tab='Kusama proposal' key='proposal'>
      {/* <KusamaProposalForm {...props} /> */}
    </TabPane>
    <TabPane tab='Regular product' key='regular'>
      <ProductForm {...props} />
    </TabPane>
  </Tabs>
}

export function FormInSection (props: ProductFormProps) {
  const { storefront, product } = props
//  const { hasKusamaConnection } = useKusamaContext()

  const pageTitle = product ? `Edit product` : `New product`

  const sectionTitle =
    <StorefrontgedSectionTitle storefront={storefront} subtitle={pageTitle} />

  return <PageContent>
    <HeadMeta title={pageTitle} />
    <div className='EditEntityPage'>
    <h1 className="PageTitle">{sectionTitle}</h1>
     <ProductForm {...props} />
    </div>
  </PageContent>
}

function LoadProductThenEdit (props: ProductFormProps) {
  const { productId } = useRouter().query
  const myAddress = useMyAddress()
  const [ isLoaded, setIsLoaded ] = useState(false)
  const [ product, setProduct ] = useState<ProductData>()

  useDarkdotEffect(({ darkdot }) => {
    const load = async () => {
      if (typeof productId !== 'string') return

      setIsLoaded(false)
      const id = new BN(productId)
      console.log('********** LoadProductThenEdit for ID = '+id)
      setProduct(await darkdot.findProduct({ id }))
      setIsLoaded(true)
    }
    load()
  }, [ productId ])

  if (!isLoaded) return <Loading label='Loading the product...' />

  if (!product) return <NoData description='Product not found' />

  const productOwner = product.struct?.owner
  // const price = product.struct?.price_usd
  console.log('************ Loaded product : '+product.struct.content)
  const isOwner = equalAddresses(myAddress, productOwner)
  if (!isOwner) return <NoData description='You do not have permission to edit this product' />

  return <FormInSection {...props} product={product} />
}

export const EditProduct = withLoadStorefrontFromUrl(LoadProductThenEdit)

export const NewProduct = withLoadStorefrontFromUrl(FormInSection)

export default NewProduct
