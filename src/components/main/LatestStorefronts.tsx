import React from 'react';
import { Storefront } from '@darkpay/dark-types/substrate/interfaces';
import { ViewStorefront } from '../storefronts/ViewStorefront';
import { StorefrontData } from '@darkpay/dark-types/dto';
import { CreateStorefrontButton, AllStorefrontsLink } from '../storefronts/helpers';
import DataList from '../lists/DataList';
import { ButtonLink } from 'src/components/utils/ButtonLink';

type Props = {
  storefrontsData: StorefrontData[]
  canHaveMoreStorefronts?: boolean
}

export const LatestStorefronts = (props: Props) => {
  const { storefrontsData = [], canHaveMoreStorefronts = true } = props
  const storefronts = storefrontsData.filter((x) => typeof x.struct !== 'undefined')

  return <>
    <DataList
      className='homeList-storefronts'
      title={<span className='d-flex justify-content-between align-items-end w-100'>
        {'Latest storefronts'}
        {canHaveMoreStorefronts && <AllStorefrontsLink />}
      </span>}
      dataSource={storefronts}
      noDataDesc='No storefronts found'
      noDataExt={<CreateStorefrontButton />}
      renderItem={(item) =>
        <ViewStorefront
          {...props}
          key={(item.struct as Storefront).id.toString()}
          storefrontData={item}
          withFollowButton
          preview
        />
      }
    />
    {canHaveMoreStorefronts &&
      <ButtonLink block href='/storefronts/all' as='/storefronts/all' className='mb-2'>
        See all storefronts
      </ButtonLink>
    }
  </>
}
