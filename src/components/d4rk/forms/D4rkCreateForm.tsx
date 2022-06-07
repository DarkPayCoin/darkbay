import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "react-query";
import D4rkServiceAPI from "../api/D4rkService"



import Section from '../../utils/Section';
import CreateD4rkAccount from './CreateD4rkAccount';


type D4rkAccountProps = {
  address: string
}


export const D4rkAccount: React.FunctionComponent<D4rkAccountProps> = React.memo(({ address }) => {


const DotkAccount = address

const Exists = async () => {
  return await D4rkServiceAPI.userExists(
    {
      username: address,
    });
}

  return <Section className={`DfD4rkAccount`}>
  <CreateD4rkAccount address={DotkAccount} />
  </Section>
})




/////////////
export default D4rkAccount;