import React, { useState, createContext, useContext, useEffect } from 'react';
import { useIsSignedIn, useMyAddress } from 'src/components/auth/MyAccountContext';
import useDarkdotEffect from '../api/useDarkdotEffect';
import store from 'store'
import SignInModal from './SignInModal';
import { useRouter } from 'next/router';

const ONBOARDED_ACCS = 'df.onboarded'

export type CompletedSteps = {
  isSignedIn: boolean
  hasTokens: boolean
  hasOwnStorefronts: boolean
}

export type AuthState = {
  showOnBoarding: boolean
  currentStep: number
  completedSteps: CompletedSteps
}

function functionStub () {
  throw new Error('Function needs to be set in OnBoardingContext')
}

export type ModalKind = 'OnBoarding' | 'AuthRequired' | 'SwitchAccount'

export type AuthContextProps = {
  state: AuthState,
  openSignInModal: (kind?: ModalKind) => void,
  hideSignInModal: () => void,
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
}

const contextStub: AuthContextProps = {
  state: {
    currentStep: 0,
    completedSteps: {
      isSignedIn: false,
      hasTokens: false,
      hasOwnStorefronts: false
    },
    showOnBoarding: false
  },
  openSignInModal: functionStub,
  hideSignInModal: functionStub,
  setCurrentStep: functionStub
}

export enum StepsEnum {
  Disabled = -1,
  Login,
  GetTokens,
  CreateStorefront
}

export const AuthContext = createContext<AuthContextProps>(contextStub)

export function AuthProvider (props: React.PropsWithChildren<any>) {
  const { asPath } = useRouter()

  const [ currentStep, setCurrentStep ] = useState(StepsEnum.Disabled)
  const address = useMyAddress()
  const [ onBoardedAccounts ] = useState<string[]>(store.get(ONBOARDED_ACCS) || [])

  const noOnBoarded = !address || !onBoardedAccounts.includes(address)
  const [ showOnBoarding, setShowOnBoarding ] = useState(noOnBoarded)
  const [ showModal, setShowModal ] = useState<boolean>(false);
  const [ kind, setKind ] = useState<ModalKind>()
  const [ hasTokens, setTokens ] = useState(false)
  const [ hasOwnStorefronts, setStorefronts ] = useState(false)
  const isSignedIn = useIsSignedIn()

  useDarkdotEffect(({ substrate }) => {
    if (!isSignedIn) {
      return setCurrentStep(0)
    }

    let unsubBalance: (() => void) | undefined
    let unsubStorefront: (() => void) | undefined

    const subStorefront = async (isBalanse: boolean) => {
      const api = await substrate.api
      unsubStorefront = await api.query.storefronts.storefrontIdsByOwner(address, (data) => {
        if (data.isEmpty) {
          setStorefronts(false)
          if (isBalanse) {
            step = StepsEnum.CreateStorefront
          }
        } else if (step === StepsEnum.Disabled) {
          setStorefronts(true)
          setShowModal(false)
          noOnBoarded && store.set(ONBOARDED_ACCS, address)
        }

        setShowOnBoarding(step !== StepsEnum.Disabled)
        setCurrentStep(step)
      })
    }

    let step = StepsEnum.Disabled;
    const subBalance = async () => {
      if (!address) return

      const api = await substrate.api
      unsubBalance = await api.derive.balances.all(address, (data) => {
        const balance = data.freeBalance.toString()
        const isEmptyBalanse = balance === '0'
        if (isEmptyBalanse) {
          setTokens(false)
          step = StepsEnum.GetTokens
        } else {
          setTokens(true)
        }
        subStorefront(!isEmptyBalanse)
      });
    }

    subBalance();

    return () => {
      unsubStorefront && unsubStorefront()
      unsubBalance && unsubBalance()
    }
  }, [ address, isSignedIn, currentStep ])

  useEffect(() => setShowModal(false), [ asPath ])

  const contextValue = {
    state: {
      showOnBoarding: showOnBoarding,
      currentStep,
      completedSteps: {
        isSignedIn,
        hasTokens,
        hasOwnStorefronts
      }
    },
    openSignInModal: (kind?: ModalKind) => {
      setKind(kind || 'OnBoarding')
      setShowModal(true)
    },
    hideSignInModal: () => {
      address && setShowModal(false)
    },
    setCurrentStep
  }

  return <AuthContext.Provider value={contextValue}>
    {props.children}
    {kind && <SignInModal open={showModal} kind={kind} hide={() => setShowModal(false)} />}
  </AuthContext.Provider>
}

export function useAuth () {
  return useContext(AuthContext)
}

export function MockAuthProvider (props: React.PropsWithChildren<AuthState>) {
  return <AuthContext.Provider value={{ ...contextStub, state: { ...props, showOnBoarding: true } }}>
    {props.children}
  </AuthContext.Provider>
}

export function withAuthContext (Component: React.ComponentType<any>) {
  return <AuthProvider><Component/></AuthProvider>
}
