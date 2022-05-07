import React from "react";


import SubTitle from "../utils/SubTitle";

type EmptyCartProps = {

}

export const EmptyCart = ({ }: EmptyCartProps) => {


 

    return (
        <>
        <div id="viewcart">
            <h1 className="PageTitle flex-center">My cart</h1>

           <SubTitle title='Your cart is empty...' className='empty-cart-titke' />
       
        </div>
        </>
    );
}

export default EmptyCart;

