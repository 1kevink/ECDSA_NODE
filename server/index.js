const express = require("express");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "02eac9b5371d42a6437181f7cc19b1c084c05936b5f407fd49bee553ae15c3c73a": 100,
  "0266ad10a9ecf81589899437e0552382f4b961b40759ca87e41fbc7507e5ff440b": 50,
  "03270e46f9ea56adda99badb129f49b42b3e374eb26f055fa761b9039e30e58dc3": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, signature, message } = req.body;
  const { recipient, amount } = message;

  const sig = {
    ...signature,
    r: BigInt(signature.r),
    s: BigInt(signature.s)
  }

  const hashMessage = (message) => {
    return keccak256(Uint8Array.from(message));
  }

  const isSignatureValid = secp256k1.verify(sig, hashMessage(message), sender)
  

  setInitialBalance(sender);
  setInitialBalance(recipient);
  if(!isSignatureValid) {
    res.status(400).send({message: "Signature is not valid"})
  }

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

