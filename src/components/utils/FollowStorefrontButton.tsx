import React, { useState } from 'react';
import { useMyAddress } from '../auth/MyAccountContext';
import TxButton from './TxButton';
import { useSidebarCollapsed } from './SideBarCollapsedContext';
import BN from 'bn.js';
import { newLogger, notDef } from '@darkpay/dark-utils';
import useDarkdotEffect from '../api/useDarkdotEffect';
import { BaseTxButtonProps } from '../substrate/SubstrateTxButton';

const log = newLogger('FollowStorefrontButton')

type FollowStorefrontButtonProps = BaseTxButtonProps & {
  storefrontId: BN,
};

type InnerFollowStorefrontButtonProps = FollowStorefrontButtonProps & {
  myAddress?: string
};

export function FollowStorefrontButton (props: FollowStorefrontButtonProps) {
  const myAddress = useMyAddress()

  return <InnerFollowStorefrontButton {...props} myAddress={myAddress}/>;
}

export function InnerFollowStorefrontButton (props: InnerFollowStorefrontButtonProps) {
  const { storefrontId, myAddress, ...otherProps } = props;
  const { reloadFollowed } = useSidebarCollapsed();
  const [ isFollower, setIsFollower ] = useState<boolean>();

  const onTxSuccess = () => {
    reloadFollowed();
    setIsFollower(!isFollower);
  };

  useDarkdotEffect(({ substrate }) => {
    let isSubscribe = true;

    if (!myAddress) return isSubscribe && setIsFollower(false)

    const load = async () => {
      const res = await (substrate.isStorefrontFollower(myAddress, storefrontId))
      isSubscribe && setIsFollower(res)
    };

    load().catch(err => log.error(
      `Failed to check if the current account is following a storefront with id ${storefrontId.toString()}. Error:`, err));

    return () => { isSubscribe = false; };
  }, [ myAddress ]);

  const buildTxParams = () => [ storefrontId ]

  const loading = notDef(isFollower)

  const label = isFollower
    ? 'Unfollow'
    : 'Follow'

  return <TxButton
    type='primary'
    loading={loading}
    ghost={isFollower}
    label={loading ? undefined : label}
    tx={isFollower
      ? `storefrontFollows.unfollowStorefront`
      : `storefrontFollows.followStorefront`}
    params={buildTxParams}
    onSuccess={onTxSuccess}
    withSpinner
    {...otherProps}
  />
}

export default FollowStorefrontButton;
