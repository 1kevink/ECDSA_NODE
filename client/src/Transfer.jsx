import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

import { useState } from "react";
import server from "./server";



function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  const hashMessage = (message) => {
    return keccak256(Uint8Array.from(message));
  }
  
  const signMessage = (message) => secp256k1.sign(hashMessage(message), privateKey);
  
  const stringifyBigInts = obj =>{
    for(let prop in obj){
      let value = obj[prop];
      if(typeof value === 'bigint'){
        obj[prop] = value.toString();
      }else if(typeof value === 'object' && value !== null){
        obj[prop] = stringifyBigInts(value);
      }
    }
    return obj;
  }

  async function transfer(evt) {
    evt.preventDefault();

    
    const message = { amount: parseInt(sendAmount), recipient };
    const sig = signMessage(message);
    const sigStringified = stringifyBigInts(sig)

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        message,
        signature: sigStringified,  
      });
      setBalance(balance);
    } catch (ex) {
      console.log(ex);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
