import axios from "axios";
import D4rkService from "./ApiTypes";
import authHeader from "./AuthHeaders"

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:7776/api/v1",
  headers: {
    "Content-type": "application/json",
  },
});

const createAccount = async ({ username, password }: D4rkService) => {
  const response = await apiClient.post<any>("/user/register", { username, password });
  // console.log(response.data);
  return response.data;
}

const loginAccount = async ({ username, password }: D4rkService) => {
    const response = await apiClient.post<any>("/user/login", { username, password });
    if (response.data.data) {
        localStorage.setItem("darkuser", JSON.stringify(response.data.data));
      }
    // console.log(response.data);
    return response.data;
  }

  const userExists = async ({ username }: D4rkService) => {
    const response = await apiClient.post<any>("/user/exists", { username });
    // console.log(response.data);
    return response.data;
  }
  
  const d4rkAddress = async () => {
    const response = await apiClient.get<any>("/user/address", { headers: authHeader() });
    // console.log(response.data);
    return response.data;
  }

  const userTxs = async () => {
    const response = await apiClient.get<any>("/wallet/transactions", { headers: authHeader() });
    // console.log(response.data);
    return response.data;
  }

  const d4rkBalance = async () => {
    const response = await apiClient.get<any>("/user/balance", { headers: authHeader() });
    // console.log(response.data);
    return response.data;
  }

  const lockTx = async ({ amount, recipient }: D4rkService) => {
    try {
    const response = await apiClient.post<any>("/wallet/lock", { amount, recipient}, { headers: authHeader() } );
    // console.log(response.data);
    return response.data;
    }
    catch(err) {
    console.warn(err)
    return(err)
    }
    
  }

  const d4rkApiV = async () => {
    const response = await apiClient.post<any>("/user/api", {});
    // console.log(response.data);
    return response.data;
  }

  
  

const D4rkServiceAPI = {
  createAccount,
  loginAccount,
  userExists,
  d4rkAddress,
  d4rkBalance,
  lockTx,
  userTxs,
  d4rkApiV,
}
export default D4rkServiceAPI;