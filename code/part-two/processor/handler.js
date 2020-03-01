"use strict";

const { TransactionHandler } = require("sawtooth-sdk/processor/handler");
const { InvalidTransaction } = require("sawtooth-sdk/processor/exceptions");
const { decode, encode } = require("./services/encoding");
const {
  getCollectionAddress,
  getMojiAddress,
  getSireAddress
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
    let payload;
    try {
      payload = decode(txn.payload);
    } catch (e) {
      throw new InvalidTransaction(e);
    }
    const collectionAddr = getCollectionAddress(signer);
    const sireMojiAddr = payload.sire;
    const breederMojiAddr = payload.breeder;
    let update = {};

    switch (payload.action) {
      case "CREATE_COLLECTION":
        // check if address already has an associated collection
        return (
          context
            .getState([collectionAddr])
            .then(state => {
              if (state[collectionAddr].length !== 0) {
                throw new Error("This address already has a collection.");
              }
            })
            // if not, create an update object making three moji and hold their addresses in moji
            .then(() => {
              const stateResources = {
                key: signer,
                moji: this.makeMoji(
                  signer,
                  context,
                  txn.signature,
                  null,
                  null,
                  3
                )
              };
              update[collectionAddr] = encode(stateResources);
              return context.setState(update);
            })
            // throw an InvalidTransaction exception in case of a collection already existing
            .catch(err => {
              throw new InvalidTransaction(err);
            })
        );
        break;

      case "SELECT_SIRE":
        const sireListingAddr = getSireAddress(signer);
        const sireState = { owner: signer, sire: payload.sire };
        update[sireListingAddr] = encode(sireState);

        // return context.setState(update);

        return context
          .getState([collectionAddr])
          .then(state => {
            if (state[collectionAddr].length === 0) {
              throw new Error("No collection found");
            }

            return context.getState([sireMojiAddr]);
          })
          .then(mojiState => {
            if (mojiState.length === 0) {
              throw new Error("The selected sire doesn't exist");
            }
            const mojiDecoded = decode(mojiState[sireMojiAddr]);
            if (mojiDecoded.owner !== signer) {
              throw new Error("You don't own the selected sire");
            }
          })
          .then(() => {
            return context.setState(update);
          })
          .then(addresses => addresses)
          .catch(err => {
            // console.error(err);
            throw new InvalidTransaction(err);
          });
        break;

      case "BREED_MOJI":
        let sireListing, newMojiAddresses, sireDecoded, breederDecoded;
        return context
          .getState([collectionAddr])
          .then(state => {
            if (state[collectionAddr].length === 0) {
              throw new Error("No collection found");
            }
            return context.getState([sireMojiAddr]);
          })
          .then(mojiState => {
            if (mojiState.length === 0) {
              throw new Error("The selected sire doesn't exist");
            }
            sireDecoded = decode(mojiState[sireMojiAddr]);
            return sireDecoded.owner;
          })
          .then(sireOwner => {
            sireListing = getSireAddress(sireOwner);
            return context.getState([sireListing]);
          })
          .then(sireListingState => {
            const sireListingDecoded = decode(sireListingState[sireListing]);
            if (sireListingDecoded.sire !== sireMojiAddr) {
              throw new Error(
                "Your selection for sire is not available for siring"
              );
            }
            return context.getState([breederMojiAddr]);
          })
          .then(breederState => {
            if (breederState.length === 0) {
              throw new Error("Your breeder doesn't exist");
            }
            breederDecoded = decode(breederState[breederMojiAddr]);
            if (breederDecoded.owner !== signer) {
              throw new Error("You don't own the selected breeder");
            }
            return this.makeMoji(
              signer,
              context,
              txn.signature,
              sireMojiAddr,
              breederMojiAddr,
              1
            );
          })
          .then(mojiAddresses => {
            newMojiAddresses = mojiAddresses;
            return context.getState([collectionAddr]);
          })
          .then(collectionState => {
            const collectionDecoded = decode(collectionState[collectionAddr]);
            collectionDecoded.moji = collectionDecoded.moji.concat(
              newMojiAddresses
            );
            update = {};
            update[collectionAddr] = encode({
              key: signer,
              moji: collectionDecoded.moji
            });
            return context.setState(update);
          })
          .then(addressUpdated => {
            breederDecoded.bred = breederDecoded.bred.concat(newMojiAddresses);
            update = {};
            update[breederMojiAddr] = encode(breederDecoded);
            return context.setState(update);
          })
          .then(breederAddress => {
            sireDecoded.sired = sireDecoded.sired.concat(newMojiAddresses);
            update = {};
            update[sireMojiAddr] = encode(sireDecoded);
            return context.setState(update);
          })
          .catch(err => {
            // console.error(err);
            throw new InvalidTransaction(err);
          });
        break;
      default:
        throw new InvalidTransaction("Payload action not understood");
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
