import React, { useState } from 'react';
import { GenericAccountId } from '@polkadot/types';
import { useMyAddress, isMyAddress } from '../auth/MyAccountContext';
import { registry } from '@darkpay/dark-types/substrate/registry';
import { newLogger, notDef } from '@darkpay/dark-utils';
import useDarkdotEffect from '../api/useDarkdotEffect';
import TxButton from './TxButton';
import { AccountId } from '@polkadot/types/interfaces';

const log = newLogger('FollowAccountButton')

type FollowAccountButtonProps = {
  address: string | AccountId
  className?: string
}

function FollowAccountButton (props: FollowAccountButtonProps) {
  const { address, className = '' } = props;
  const myAddress = useMyAddress()
  const [ isFollower, setIsFollower ] = useState<boolean>();

  useDarkdotEffect(({ substrate }) => {
    let isSubscribe = true;

    if (!myAddress) return isSubscribe && setIsFollower(false);

    const load = async () => {
      const res = await substrate.isAccountFollower(myAddress, address)
      isSubscribe && setIsFollower(res);
    };

    load().catch(err => log.error(
      `Failed to check if account is a follower of another account ${address?.toString()}. ${err}`));

    return () => { isSubscribe = false; };
  }, [ myAddress ]);

  if (!address || isMyAddress(address)) return null;

  const accountId = new GenericAccountId(registry, address)

  const buildTxParams = () => [ accountId ]

  const loading = notDef(isFollower)

  const label = isFollower
    ? 'Unfollow'
    : 'Follow'

  return <span className={className}><TxButton
    className='DfFollowAccountButton'
    type='primary'
    loading={loading}
    ghost={isFollower}
    label={loading ? undefined : label }
    tx={isFollower
      ? `profileFollows.unfollowAccount`
      : `profileFollows.followAccount`}
    params={buildTxParams}
    onSuccess={() => setIsFollower(!isFollower)}
    withSpinner
  />
  </span>
}

export default FollowAccountButton;
