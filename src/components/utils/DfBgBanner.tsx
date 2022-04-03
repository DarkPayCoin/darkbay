import React from 'react';
import { resolveIpfsUrl } from 'src/ipfs';
import Link, { LinkProps } from 'next/link';

export type BgBannerProps = {
  src: string,
  size?: number | string,
  height?: number | string,
  width?: number | string,
  rounded?: boolean,
  className?: string,
};

export function DfBgBanner (props: BgBannerProps) {
  const { src, className='DfBannerLink'} = props;

  const fullClass = 'DfBgBanner ' + className;

  const fullStyle = Object.assign({
    backgroundImage: `url(${resolveIpfsUrl(src)})`,
    width: '100%',
    height: 'auto',
    minWidth: '100%',
    minHeight: 'auto',
    borderRadius: false && '0%'
  });

  return <div className={fullClass} style={fullStyle} />;
}

type DfBgBannerLinkProps = BgBannerProps & LinkProps

export const DfBgBannerLink = ({ href, as, ...props }: DfBgBannerLinkProps) => 
    <Link href={href} as={as}>
      <a>
        <DfBgBanner {...props}/>
      </a>
    </Link>
