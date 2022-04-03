import { StorefrontContent } from '@darkpay/dark-types/offchain';
import { nonEmptyStr } from '@darkpay/dark-utils';
import { mdToText } from 'src/utils';
import { NextPage } from 'next';
import Error from 'next/error';
import React, { useState } from 'react';

import { AuthorPreview } from '../profiles/address-views';
import { DfMd } from '../utils/DfMd';
import { HeadMeta } from '../utils/HeadMeta';
import { return404 } from '../utils/next';
import Section from '../utils/Section';
import { getDarkdotApi } from '../utils/DarkdotConnect';
import { formatUnixDate } from '../utils';
import ViewTags from '../utils/ViewTags';
import StorefrontStatsRow from './StorefrontStatsRow';
import { ViewStorefrontProps } from './ViewStorefrontProps';
import withLoadStorefrontDataById from './withLoadStorefrontDataById';
import { PageContent } from '../main/PageWrapper';
import { getStorefrontId } from '../substrate';
import { StorefrontNotFound } from './helpers';

type Props = ViewStorefrontProps

export const AboutStorefrontPage: NextPage<Props> = (props) => {
  if (props.statusCode === 404) return <Error statusCode={props.statusCode} />

  const { storefrontData } = props;

  if (!storefrontData || !storefrontData?.struct) {
    return <StorefrontNotFound />
  }

  const { owner } = props;
  const storefront = storefrontData.struct;
  const { created: { time }, owner: storefrontOwnerAddress } = storefront;

  const [ content ] = useState(storefrontData?.content || {} as StorefrontContent);
  const { name, about, image, tags } = content;

  const StorefrontAuthor = () =>
    <AuthorPreview
      address={storefrontOwnerAddress}
      owner={owner}
      withFollowButton
      isShort={true}
      isPadded={false}
      details={<div>Created on {formatUnixDate(time)}</div>}
    />

  const title = `About ${name}`

  // TODO extract WithStorefrontNav

  return <PageContent>
    <HeadMeta title={title} desc={mdToText(about)} image={image} />
      <Section className='DfContentPage' level={1} title={title}>
        <div className='DfRow mt-3'>
          <StorefrontAuthor />
          <StorefrontStatsRow storefront={storefront} />
        </div>

        {nonEmptyStr(about) &&
          <div className='DfBookPage'>
            <DfMd source={about} />
          </div>
        }
        <ViewTags tags={tags} />
    </Section>
  </PageContent>
}

// TODO extract getInitialProps, this func is similar in ViewStorefront

AboutStorefrontPage.getInitialProps = async (props): Promise<Props> => {
  const { query: { storefrontId } } = props
  const idOrHandle = storefrontId as string

  const id = await getStorefrontId(idOrHandle)
  if (!id) {
    return return404(props)
  }

  const darkdot = await getDarkdotApi()
  const storefrontData = id && await darkdot.findStorefront({ id })
  if (!storefrontData?.struct) {
    return return404(props)
  }

  const ownerId = storefrontData?.struct.owner
  const owner = await darkdot.findProfile(ownerId)

  return {
    storefrontData,
    owner
  }
}

export default AboutStorefrontPage

export const AboutStorefront = withLoadStorefrontDataById(AboutStorefrontPage)
