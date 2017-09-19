const prod = process.env.NODE_ENV === "production"

export default {
  API: prod ? "https://mam.tangle.works/" : "http://localhost:3000/",
  IOTA: prod
    ? "https://testnet.tangle.works:443"
    : "https://testnet.tangle.works:443",
  PROD: prod ? true : false
}
