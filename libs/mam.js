import Presets from "../presets"

import IOTA from "iota.lib.js"
import MamClient from "./mam.client.js/lib/mam.client.js"
import Crypto from "crypto.iota.js"
import { isClient } from "./utils"
const MAM = MamClient.MAM
const MerkleTree = MamClient.Merkle
const Encryption = MamClient.Encryption
const iota = new IOTA({ provider: Presets.IOTA })

// SendTransfer Settings
const MWM = 9
const DEPTH = 5

export const init = (
  seed,
  pubStart = 3,
  pubIndex = 0,
  count = 4,
  security = 1
) => {
  var channelSeed = Encryption.hash(Crypto.converter.trits(seed.slice()))
  var channelKey = Crypto.converter.trytes(channelSeed.slice())
  const pubTree0 = new MerkleTree(seed, pubStart, count, security)
  const pubTree1 = new MerkleTree(seed, pubStart + count, count, security)
  const subscribed = []
  const timeout = 1000

  subscribed[channelKey] = {
    channelKey: channelKey,
    timeout: 1000,
    subroot: null,
    subRootNext: null,
    nextKey: null,
    active: true
  }
  return {
    pubTree0: pubTree0,
    pubTree1: pubTree1,
    pubStart: pubStart,
    pubIndex: pubIndex,
    count: count,
    security: security,
    subscribed: subscribed,
    timeout: timeout,
    channelKey: channelKey,
    seed: seed
  }
}

export const newSub = (state, channelKey) => {
  state.subscribed[channelKey] = {
    channelKey: channelKey,
    timeout: 1000,
    subroot: null,
    subRootNext: null,
    nextKey: null,
    active: true
  }
  return state
}

export const channelkey = seed => {
  return Crypto.converter.trytes(
    Encryption.hash(Crypto.converter.trits(seed.slice())).slice()
  )
}

export const publishMAM = (state, message) => {
  const mam = new MAM.create({
    message: iota.utils.toTrytes(message),
    merkleTree: state.pubTree0,
    index: state.pubIndex,
    nextRoot: state.pubTree1.root.hash.toString(),
    channelKey: state.channelKey
  })
  let channelKey = mam.nextKey
  state = incrementPubIndex(state)
  return new Promise(resolve => {
    if (isClient) curl.overrideAttachToTangle(iota.api)

    iota.api.sendTrytes(mam.trytes, DEPTH, MWM, (err, tx) => {
      if (err) console.log("Error:", err)
      else console.log("Published!")
      resolve({ tx, state })
    })
  })
}

function incrementPubIndex(state) {
  state.pubIndex++
  if (state.pubIndex >= state.pubTree0.root.size()) {
    state.pubTree0 = state.pubTree1
    state.pubTree1 = new MerkleTree(
      state.seed,
      state.pubStart + state.count,
      state.count,
      state.security
    )
    state.pubStart += state.count
  }
  return state
}

export const fetchMAMs = (state, channelKey, callback) => {
  console.log("Fetching Channel")
  return new Promise(resolve => {
    iota.api.sendCommand(
      {
        command: "MAM.getMessage",
        channel: MAM.messageID(channelKey)
      },
      (err, result) => {
        if (err == undefined && result.ixi) {
          callback(`MSG Found for: ${channelKey.slice(0, 10)}...`)
          console.log(result)
          result.ixi.forEach(mam => {
            const output = MAM.parse({
              key: channelKey,
              message: mam.message,
              tag: mam.tag
            })
            const asciiMessage = iota.utils.fromTrytes(output.message)
            // console.log(output.root, "->", output.nextRoot)
            if (state.subscribed[channelKey].subRoot === output.root) {
              state.subscribed[channelKey].subRootNext = output.nextRoot
            } else if (
              state.subscribed[channelKey].subRootNext === output.root
            ) {
              state.subscribed[channelKey].subRoot = subRootNext
              state.subscribed[channelKey].subRootNext = output.nextRoot
            } else {
              // console.log("Public Keys do not match!")
              callback("Public Keys do not match!")
              state.subscribed[channelKey].subRoot = output.root
              state.subscribed[channelKey].subRootNext = output.nextRoot
            }
            // console.log("Message:", asciiMessage)
            state.subscribed[channelKey].nextKey = output.nextKey
            // console.log("NEXTKEY: ", state.subscribed[channelKey].nextKey)
            callback(null, {
              message: asciiMessage,
              nextKey: state.subscribed[channelKey].nextKey
            })
            // state.subscribed[channelKey].timeout = setTimeout(() => {
            //   if (!state.subscribed[channelKey].active) {
            //     return
            //   }
            //   fetchMAMs(
            //     state,
            //     state.subscribed[channelKey].nextKey,
            //     callback
            //   ).then(resolve)
            // }, state.timeout)
          })
        } else {
          // state.subscribed[channelKey].timeout = setTimeout(() => {
          //   if (!state.subscribed[channelKey].active) {
          //     return
          //   }
          //   fetchMAMs(state, channelKey, callback).then(resolve)
          // }, state.timeout)
        }
        resolve(state)
      }
    )
  })
}
