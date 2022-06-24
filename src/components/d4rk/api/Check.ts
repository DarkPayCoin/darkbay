import D4rkServiceAPI from "./D4rkService";

export async function checkD4rkApi(): Promise<string> {
  try {
    const response = await D4rkServiceAPI.d4rkApiV();
    const json = await response;
     console.log(json);
      return (json.data)
  }
  catch(error) {
    if (error instanceof Error) {
      console.log(error.message);
      return(error.message)
    }
    else {
      return('Error checking if D4RK chain API is live!')
    }
  }
}

export async function getUserExists(usr: string): Promise<string> {
  try {
    const response = await D4rkServiceAPI.userExists(
      {
        username: usr
      });
    const json = await response;
     console.log(json);
      return (json.data)
  }
  catch(error) {
    if (error instanceof Error) {
      console.log(error.message);
      return(error.message)
    }
    else {
      return('Error checking if user exists in D4RK chain db!')
    }
  }
}