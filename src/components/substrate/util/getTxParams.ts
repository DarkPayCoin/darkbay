import { newLogger } from '@darkpay/dark-utils';
import { CommonContent } from '@darkpay/dark-types';
import { IpfsCid } from '@darkpay/dark-types/substrate/interfaces';
import { DarkdotIpfsApi } from '@darkpay/dark-api/';

const log = newLogger('BuildTxParams')

// TODO rename setIpfsCid -> setIpfsCid
type Params<C extends CommonContent> = {
  ipfs: DarkdotIpfsApi
  json: C
  setIpfsCid: (cid: IpfsCid) => void
  buildTxParamsCallback: (cid: IpfsCid) => any[]
}

// TODO rename to: pinToIpfsAndBuildTxParams()
export const getTxParams = async <C extends CommonContent> ({
  ipfs,
  json,
  setIpfsCid,
  buildTxParamsCallback
}: Params<C>) => {
  try {
    const cid = await ipfs.saveContent(json)
    if (cid) {
      setIpfsCid(cid)
      return buildTxParamsCallback(cid)
    } else {
      log.error('Save to IPFS returned an undefined CID')
    }
  } catch (err) {
    log.error(`Failed to build tx params. ${err}`)
  }
  return []
}
