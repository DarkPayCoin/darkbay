import React from "react";

import { PageContent } from "../main/PageWrapper";

import Section from "../utils/Section";
import SubTitle from "../utils/SubTitle";

type EmptyCartProps = {

}

export const EmptyCart = ({ }: EmptyCartProps) => {


 

    return (
        <>

           <SubTitle title='Your cart is empty.' className='empty-cart-titke' />
       

        </>
    );
}

export default EmptyCart;

