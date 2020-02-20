"use strict";

const { TransactionHandler } = require("sawtooth-sdk/processor/handler");
const { InvalidTransaction } = require("sawtooth-sdk/processor/exceptions");
const { decode, encode } = require("./services/encoding");
const {
  getCollectionAddress,
  getMojiAddress
} = require("./services/addressing.js");
const getPrng = require("./services/prng.js");
const { createHash } = require("crypto");

const FAMILY_NAME = "cryptomoji";
const FAMILY_VERSION = "0.1";
const NAMESPACE = "5f4d76";

/**
 * A Cryptomoji specific version of a Hyperledger Sawtooth Transaction Handler.
 */
class MojiHandler extends TransactionHandler {
  /**
   * The constructor for a TransactionHandler simply registers it with the
   * validator, declaring which family name, versions, and namespaces it
   * expects to handle. We'll fill this one in for you.
   */
  constructor() {
    console.log("Initializing cryptomoji handler with namespace:", NAMESPACE);
    super(FAMILY_NAME, [FAMILY_VERSION], [NAMESPACE]);
  }

  /**
   * The apply method is where the vast majority of all the work of a
   * transaction processor happens. It will be called once for every
   * transaction, passing two objects: a transaction process request ("txn" for
   * short) and state context.
   *
   * Properties of `txn`:
   *   - txn.payload: the encoded payload sent from your client
   *   - txn.header: the decoded TransactionHeader for this transaction
   *   - txn.signature: the hex signature of the header
   *
   * Methods of `context`:
   *   - context.getState(addresses): takes an array of addresses and returns
   *     a Promise which will resolve with the requested state. The state
   *     object will have keys which are addresses, and values that are encoded
   *     state resources.
   *   - context.setState(updates): takes an update object and returns a
   *     Promise which will resolve with an array of the successfully
   *     updated addresses. The updates object should have keys which are
   *     addresses, and values which are encoded state resources.
   *   - context.deleteState(addresses): deletes the state for the passed
   *     array of state addresses. Only needed if attempting the extra credit.
   */
  apply(txn, context) {
    const signer = txn.header.signerPublicKey;
    const payload = decode(txn.payload);
    switch (payload.action) {
      case "CREATE_COLLECTION":
        const addr = getCollectionAddress(signer);
        return context
          .getState([addr])
          .then(state => {
            if (state[addr].length !== 0) {
              throw new Error("This address already has a collection.");
            }
          })
          .then(() => {
            const update = {};
            const stateResources = {
              key: signer,
              moji: this.makeMoji(signer, context, txn.signature, null, null, 3)
            };
            update[addr] = encode(stateResources);
            return context.setState(update);
          })
          .catch(err => {
            throw new InvalidTransaction(err);
          });
        break;

      case "SELECT_SIRE":
        break;

      case "BREED_MOJI":
        break;
      default:
        break;
    }
  }

  makeMoji(owner, context, sig, sire = null, breeder = null, numOffspring = 1) {
    const mojiAddresses = [];

    let seed;
    if (sire !== null && breeder !== null) {
      seed = sig + sire + breeder;
    } else {
      seed = sig;
    }

    const prng = getPrng(seed);
    for (let i = 0; i < numOffspring; i++) {
      // set up a new moji object
      let moji = {
        dna: createHash("sha512")
          .update(prng(100000000).toString())
          .digest("hex")
          .slice(0, 36),
        owner: owner,
        breeder: breeder,
        sire: sire,
        bred: [],
        sired: []
      };
      // update state with new moji
      let addr = getMojiAddress(moji.owner, moji.dna);
      mojiAddresses.push(addr);
      let update = {};
      update[addr] = encode(moji);
      context.setState(update);
    }

    return mojiAddresses;
  }
}

module.exports = MojiHandler;
