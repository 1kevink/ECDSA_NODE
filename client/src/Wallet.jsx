import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";

import server from "./server";

function Wallet({ address, setAddress, balance, setBalance, setPrivateKey, privateKey }) {
  async function onChange(evt) {
    console.log(evt)
    const privateKey = evt.target.value;
    const address = toHex(secp256k1.getPublicKey(privateKey));
    setPrivateKey(privateKey);
    //console.log(toHex(secp256k1.getPublicKey(privateKey)))
    setAddress(address)
    if (address) {
      const { 
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Private Key</h1>

      <label>
        Private Key
        <input placeholder="Type in ur private key" value={privateKey} onChange={onChange}></input>
      </label>

      <label>
        Address: {address}
      <div className="balance">Balance: {balance}</div>
      </label>
    </div>
  );
}

export default Wallet;
