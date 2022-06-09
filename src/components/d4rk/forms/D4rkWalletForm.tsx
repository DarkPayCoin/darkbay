import { Spin } from "antd";
import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Copy } from "src/components/urls/helpers";
import { Section } from "src/components/utils/Section";
import D4rkServiceAPI from "../api/D4rkService"


const D4rkWalletForm = () => {
    const [d4rkAddress, setD4rkAddress] = useState("");
    const [isLoading, setisLoading] = useState(true);
    
    useEffect(() => {
        

        const fetchData = async () => {
            try {
                const response = await D4rkServiceAPI.d4rkAddress();
                const json = await response;
                console.log(json);
                setD4rkAddress(json.data);
                setisLoading(false);
            } catch (error) {
                console.log("error", error);
            }
        };

        fetchData();
    }, []);


    if(!isLoading) {
    return (
      <Section>
      <div className = "darkwallet-child">
        <h3><Copy text={d4rkAddress} message="D4RK address copied!">{d4rkAddress}</Copy></h3>
      </div>
       <div className = "darkwallet-child">
        <QRCode value={d4rkAddress} size={156} level='H' />
      </div>
      {/* <div className = "darkwallet-child">
        <a target="_blank" className="antd-btn" href={"https://explorer.darkpay.market/address/" + d4rkAddress}>View in explorer</a>
      </div> */}
      </Section>
    );
    }
    return <Spin />
};


// const D4rkWalletForm: React.FC<D4rkWalletFormProps> = ({ address }) => {
//   const [postTitle, setPostTitle] = useState("");
//   const [postDescription, setPostDescription] = useState("");
//   const [postResult, setPostResult] = useState<string | null>(null);
//   const fortmatResponse = (res: any) => {
//     return JSON.stringify(res, null, 2);
//   };
//   const { isLoading: isPostingD4rk, mutate: postD4rk } = useMutation<any, Error>(
//     async () => {
//       return await D4rkServiceAPI.d4rkAddress();
//     },
//     {
//       onSuccess: (res) => {
//         setPostResult(fortmatResponse(res));
//       },
//       onError: (err: any) => {
//         setPostResult(fortmatResponse(err.response?.data || err));
//       },
//     }
//   );
//   useEffect(() => {
//     if (isPostingD4rk) setPostResult("posting...");
//   }, [isPostingD4rk]);
//   function postData() {
//     try {
//       postD4rk();
//     } catch (err) {
//       setPostResult(fortmatResponse(err));
//     }
//   }
 
//   return (
//     <div id="d4rkwalletform" className="container">
//                  <pre>{postResult}</pre>
//     </div>
//   );
// }

export default D4rkWalletForm;


