import React, { useState, useEffect } from "react";




import Section from '../../utils/Section';
import CreateD4rkAccount from './CreateD4rkAccount';


type D4rkAccountProps = {
  address: string
}


export const D4rkAccount: React.FunctionComponent<D4rkAccountProps> = React.memo(({ address }) => {


const DotkAccount = address


  return <Section className={`DfD4rkAccount`}>
  <CreateD4rkAccount address={DotkAccount} />
  </Section>
})




/////////////
export default D4rkAccount;