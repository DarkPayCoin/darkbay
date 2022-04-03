/* eslint-disable react/display-name */
import React, { useState } from 'react'
import { Select } from 'antd'
import { LabeledValue } from 'antd/lib/select'
import BN from 'bn.js'
import useDarkdotEffect from '../api/useDarkdotEffect'
import { isEmptyArray } from '@darkpay/dark-utils'
import { StorefrontData } from '@darkpay/dark-types/dto'
import { StorefrontAvatar } from '../storefronts/helpers'


type Props = {
  imageSize?: number,
  storefrontIds: BN[],
  onSelect?: (value: string | number | LabeledValue) => void,
  defaultValue?: string,
  storefrontsData?: StorefrontData[]
};


const SelectStorefrontPreview = (props: Props) => {
  const { storefrontsData = [], onSelect, defaultValue, imageSize } = props

  if (isEmptyArray(storefrontsData)) return null

  return <Select
    style={{ width: 200 }}
    onSelect={onSelect}
    defaultValue={defaultValue}
  >
    {storefrontsData.map(({ struct, content }) => {
      if (!content) return null

      const { id, owner } = struct
      const { image, name } = content

      const idStr = id.toString()

      return <Select.Option value={idStr} key={idStr}>
        <div className={'ProfileDetails DfPreview'}>
          <StorefrontAvatar address={owner} storefront={struct} avatar={image} size={imageSize} asLink={false} />
          <div className='content'>
            <div className='handle'>{name}</div>
          </div>
        </div>
      </Select.Option>
    })}
  </Select>
}

const GetStorefrontData = (Component: React.ComponentType<Props>) => {
  return (props: Props) => {
    const { storefrontIds } = props
    const [ currentStorefrontsData, setCurrentStorefrontsData ] = useState<StorefrontData[]>([])

    useDarkdotEffect(({ darkdot }) => {
      const loadStorefronts = async () => {
        const storefrontsData = await darkdot.findPublicStorefronts(storefrontIds)
        setCurrentStorefrontsData(storefrontsData)
      }

      loadStorefronts()
    }, [ storefrontIds ])

    if (isEmptyArray(storefrontIds)) return null

    if (!currentStorefrontsData) return null

    return <Component storefrontsData={currentStorefrontsData} {...props} />
  }
}

export default GetStorefrontData(SelectStorefrontPreview)
