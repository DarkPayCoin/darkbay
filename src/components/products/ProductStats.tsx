import React, { useState } from 'react';
import { Option } from '@polkadot/types';
import { ProductId, Product } from '@darkpay/dark-types/substrate/interfaces/darkdot';
import { MutedSpan } from '../utils/MutedText';
import { ProductVoters, ActiveVoters } from '../voting/ListVoters';
import { Pluralize } from '../utils/Plularize';
import BN from 'bn.js';
import { withCalls, withMulti, productsQueryToProp } from '../substrate';
import { nonEmptyStr } from '@darkpay/dark-utils';

type StatsProps = {
  id: ProductId
  productById?: Option<Product>
  goToCommentsId?: string
};

const InnerStatsPanel = (props: StatsProps) => {
  const { productById, goToCommentsId } = props;

  const [ commentsSection, setCommentsSection ] = useState(false);
  const [ productVotersOpen, setProductVotersOpen ] = useState(false);

  if (!productById || productById.isNone) return null;
  const product = productById.unwrap();

  const { upvotes_count, downvotes_count, replies_count, shares_count, score, id } = product;
  const reactionsCount = new BN(upvotes_count).add(new BN(downvotes_count));
  const showReactionsModal = () => reactionsCount && setProductVotersOpen(true);

  const toggleCommentsSection = goToCommentsId ? undefined : () => setCommentsSection(!commentsSection)
  const comments = <Pluralize count={replies_count} singularText='Comment' />

  return <>
    <div className='DfCountsPreview'>
      <MutedSpan className={reactionsCount ? '' : 'disable'}>
        <span className='DfBlackLink' onClick={showReactionsModal}>
          <Pluralize count={reactionsCount} singularText='Reaction' />
        </span>
      </MutedSpan>
      <MutedSpan>
        {nonEmptyStr(goToCommentsId)
          ? <a className='DfBlackLink' href={'#' + goToCommentsId}>{comments}</a>
          : <span onClick={toggleCommentsSection}>{comments}</span>
        }
      </MutedSpan>
      <MutedSpan><Pluralize count={shares_count} singularText='Share' /></MutedSpan>
      <MutedSpan><Pluralize count={score} singularText='Point' /></MutedSpan>
    </div>
    <ProductVoters id={id} active={ActiveVoters.All} open={productVotersOpen} close={() => setProductVotersOpen(false)} />
  </>;
};

export default withMulti<StatsProps>(
  InnerStatsPanel,
  withCalls(
    productsQueryToProp('productById', 'id')
  )
);
