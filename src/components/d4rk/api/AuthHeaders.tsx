export default function authHeader() {

    const user = localStorage.getItem("darkuser")

    if (typeof user === 'string') {
        const parse = JSON.parse(user) // ok
        if (user && parse.token) {
            return { Authorization: 'Bearer ' + parse.token };
        }
        else {
            return {};
        }
    }
 else {
      return {};
    }
  }