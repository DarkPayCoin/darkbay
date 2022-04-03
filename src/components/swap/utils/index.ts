import ERC20ABI from '../abi/ERC20.abi.json'
export const Networks = {
  MainNet: 1,
  Ropsten: 3,
  Rinkeby: 4,
  Goerli: 5,
  Kovan: 42,
}

export interface IERC20 {
  symbol: string
  address: string
  decimals: number
  name: string
  abi: any
}

export const TOKENS_BY_NETWORK: {
  [key: number]: IERC20[]
} = {
  [Networks.MainNet]: [
    {
      address: '0x7d7587513e4674e93be5cb18d7ea6b905abd1bbc',
      name: 'DARK (ERC20)',
      symbol: 'DARK',
      decimals: 18,
      abi: ERC20ABI,
    },
  ],
  [Networks.Rinkeby]: [
    {
      address: '0xCb33A57B02d35C86349D1Cbc3f9b4B707E7857DC',
      name: 'DARK (tERC20)',
      symbol: 'DARK',
      decimals: 18,
      abi: ERC20ABI,
    },
  ],
}


export const shorter = (str: string) =>
  str?.length > 8 ? str.slice(0, 6) + '...' + str.slice(-4) : str

// export const fetcher = (library: Web3Provider, abi?: any) => (...args) => {
//   const [arg1, arg2, ...params] = args
//   // it's a contract
//   if (isAddress(arg1)) {
//     const address = arg1
//     const method = arg2
//     const contract = new Contract(address, abi, library.getSigner())
//     return contract[method](...params)
//   }
//   // it's a eth call
//   const method = arg1
//   return library[method](arg2, ...params)
// }