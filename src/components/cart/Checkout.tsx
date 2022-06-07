
import { useCart } from "react-use-cart";
import Section from "../utils/Section";
import React, { useState } from 'react'
import { Form, Input, Select } from 'antd'
import BN from 'bn.js'
import { getNewIdFromEvent, getTxParams } from '../substrate'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import {  OrderingState, IpfsContent, } from '@darkpay/dark-types/substrate/classes'
import { IpfsCid } from '@darkpay/dark-types/substrate/interfaces'
import { OrderingContent } from '@darkpay/dark-types'
import {  newLogger } from '@darkpay/dark-utils'
import { useDarkdotApi } from '../utils/DarkdotApiContext'
import { DfForm, DfFormButtons, minLenError, maxLenError } from '../forms'
import { NAME_MIN_LEN, NAME_MAX_LEN, MIN_HANDLE_LEN, MAX_HANDLE_LEN } from 'src/config/ValidationsConfig'

import { Countries } from '../utils/Countries'
import { getNonEmptyOrderingContent } from "../utils/content";
import { HeadMeta } from "../utils/HeadMeta";
import ShippingViewCart from "./ShippingViewCart";
import Item from "antd/lib/list/Item";
import ButtonLink from "../utils/ButtonLink";
// import EmptyCart from "./EmptyCart";



const log = newLogger('Checkout')


type Content = OrderingContent

type FormValues = Partial<Content & {
  //ordering_state: OrderingState
  pIds?: string[];
}>

type FieldName = keyof FormValues



const fieldName = (name: FieldName): FieldName => name

type ValidationProps = {
  minHandleLen: number
  maxHandleLen: number
  ordering? : any
}

// type FormProps = CanHaveOrderingProps & ValidationProps

type FormProps = ValidationProps



// Delivery address form
export function InnerForm (props: FormProps) {
  const [ form ] = Form.useForm()
  const { ipfs} = useDarkdotApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>()


  const { } = props


  const {emptyCart, cartTotal, items, metadata, addItem } = useCart()
// log.warn(items[0].sfId)


  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  // New order TX
  const newTxParams = (cid: IpfsCid) => {
    // Buyer escrow total
    const totalBescrow = items
    .filter((item) => item.quantity != undefined)
    .reduce(function(prev, cur) 
    {
         return (prev + ((cur.price * (cur.bescrow / 100) * cur.quantity!)) );
    }, 0); 
    const totalSescrow = items
    .filter((item) => item.quantity != undefined)
    .reduce(function(prev, cur) 
    {
         return (prev + ((cur.price * (cur.sescrow / 100) * cur.quantity!)) );
    }, 0); 
    // Shipping total
    const totalShipping = items
    .filter((item) => item.shipcost > 0)
    .reduce(function(prev, cur) 
    {
         return (prev + ((cur.shipcost * cur.quantity!)) );
    }, 0); 
    // Cart total
    const grandTotal = cartTotal + totalBescrow + totalShipping;

      const sfId = items[0].sfId
      const order_total = grandTotal
      const seller = items[0].seller
      const bescrow = totalBescrow
      const sescrow = totalSescrow

      // TODO
//      return [ sfId, new IpfsContent(cid), Number(order_total), seller, Number(bescrow), Number(sescrow), pids  ]
return [ sfId, new IpfsContent(cid), Number(order_total), seller, Number(bescrow), Number(sescrow) ]

  }



  const fieldValuesToContent = (): Content =>
    getNonEmptyOrderingContent(getFieldValues() as Content)

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
    const id = getNewIdFromEvent(txResult)
    id && goToView(id)
  }

  
  const pIds=items.map((item)=>{
    return { [item.id]: item.quantity }
})

log.warn(pIds);


  const goToView = (orderingId: BN) => {
    // Router.push('/[orderingId]', `/${orderingId}`)
    //   .catch(err => log.error(`Failed to redirect to a storefront page. ${err}`))
    log.warn('$$$$$$$$$ ORdering ID === ' + orderingId);
    let metaCart : any = metadata
    
    let forLaterCart : any = metaCart['for_later']
   
    // empty cart
    emptyCart()
    if (typeof forLaterCart == 'object') {
      for(var i = 0; i < forLaterCart.length; i++){
       if(forLaterCart[i] instanceof Array){
        let forLater : any = forLaterCart[i]
        forLater.forEach((entry: any) => {
          log.warn(entry.id);
          addItem(entry)
        });      } else {
          log.warn(forLaterCart[i]);
        }
      }
    }
 
    
  }



  return <>
              
 


  <div className="CheckoutShipping">
  <div id="shippingPanel">
    <DfForm form={form} validateTrigger={[ 'onBlur' ]} >

    <Form.Item 
      labelCol={{ span: 24 }}
      label="Name">

        <Input.Group>
        <Form.Item
            name={fieldName('name')}
            noStyle
            rules={[{ required: true, message: 'A name is mandatory !' }]}
          >
 <Input placeholder='' style={{ width: '100%' }} />
          </Form.Item>
          </Input.Group>
      </Form.Item>

      <Form.Item 
      labelCol={{ span: 24 }}
      label="Shipping Address">

        <Input.Group>
        <Form.Item
            name={fieldName('address1')}
            noStyle
            rules={[{ required: true, message: 'A delivery address is mandatory !' }]}
          >
            <Input style={{ width: '100%' }} placeholder="Number, Street, Apt." />
          </Form.Item>
          <Form.Item
            name={fieldName('address2')}
            noStyle
            rules={[{ required: false, message: 'Enter State or any relevant address info' }]}
          >
            <Input style={{ width: '100%' }} placeholder="State or any other relevant address info" />
          </Form.Item>
        <Form.Item
        name={fieldName('postal_code')}
        label='Postal Code'
        noStyle
        hasFeedback
        rules={[
          { required: true, message: 'Postal Code is required.' },
          { min: NAME_MIN_LEN, message: minLenError('Name', NAME_MIN_LEN) },
          { max: NAME_MAX_LEN, message: maxLenError('Name', NAME_MAX_LEN) }
        ]}
      >
        <Input style={{ width: '50%' }}  placeholder='Your zip/postal code' />
      </Form.Item>
      <Form.Item
        name={fieldName('city')}
        label='City'
        noStyle
        hasFeedback
        rules={[
          { required: true, message: 'City is required.' },
        ]}
      >
        <Input style={{ width: '50%' }}  placeholder='Your city' />
      </Form.Item>    
          <Form.Item
        name={fieldName('country')}
            label='Country'
            noStyle
            rules={[{ required: true, message: 'Country is required' }]}
          >
            <Select style={{ width: '50%' }} placeholder="Select country">
          {Object.keys(Countries).map(key => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
            </Select>
          </Form.Item>
  
        </Input.Group>
      </Form.Item>


      <Form.Item
        name={fieldName('memo')}
        labelCol={{ span: 24 }}
        label='Note'
        hasFeedback
        style={{ marginTop: "2rem" }}
      >
      <Input style={{ width: '100%' }} placeholder="Add a note for the seller about your order" />

      </Form.Item> 


      <Form.Item
        style={{ marginTop: "2rem" }}
              >
        <Input
         // This is where you want to disable your UI control
         disabled={true}
         placeholder={pIds.toString()}        />
</Form.Item>

 {/*
      {/* <Form.Item
        name={fieldName('email')}
        label={<span><MailOutlined /> Email address</span>}
        rules={[
          { pattern: /\S+@\S+\.\S+/, message: 'Should be a valid email' }
        ]}>
        <Input type='email' placeholder='Email address' />
      </Form.Item> */}

      <DfFormButtons
        form={form}
        txProps={{
          label: 'Create new order',
          tx: 'orderings.createOrdering',
          params: pinToIpfsAndBuildTxParams,
          onSuccess,
          onFailed
        }}
      />
    <ButtonLink className='antd-btn' href='/'>
                 Continue shopping
    </ButtonLink>

    </DfForm>
    


    </div>

      <div className="ShippingCartView">
          <ShippingViewCart />
       </div>
     </div>

  </>
} // end innerform 


// Form in section
export function FormInSection (props: Partial<FormProps>) {
  const [ consts ] = useState<ValidationProps>({
    minHandleLen: MIN_HANDLE_LEN, // bnToNum(api.consts.storefronts.minHandleLen, 5),
    maxHandleLen: MAX_HANDLE_LEN // bnToNum(api.consts.storefronts.maxHandleLen, 50)
  })
  const { } = props
  const title = `New order`

  return <>
    <HeadMeta title={title} />
    <Section className="fullFlex">
    <h1 className="PageTitle flex-center">Create order</h1>
      <InnerForm {...props} {...consts} />
    </Section>
  </>
}



// Checkout page
export const Checkout = FormInSection

export default Checkout 

