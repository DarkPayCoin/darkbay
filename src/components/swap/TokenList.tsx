import {TOKENS_BY_NETWORK} from "./utils";
import {TokenBalance} from "./TokenBalance";
import React from "react";


export const TokenList = ({ chainId }: { chainId: number }) => {
  return (
      <>
        {TOKENS_BY_NETWORK[chainId].map((token) => (
            <TokenBalance key={token.address} {...token} />
        ))}
      </>
  )
}