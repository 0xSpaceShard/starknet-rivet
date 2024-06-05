import { useState, useEffect, useContext } from 'react'

import './Screen1.css'
import PredeployedAccounts from '../components/predeployedAccounts/predeployedAccounts'
import DockerCommandGenerator from '../components/dockerCommand/dockerCommand'
import { connect } from 'get-starknet'
import { starknetWindowObject } from '../components/contractInteraction/starknetWindowObject'
// import { connect, disconnect } from "get-starknet"

export const Screen1 = () => {
  const getTime = () => {
    const date = new Date()
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${hour}:${minute}`
  }

  const [time, setTime] = useState(getTime())
  const link = 'https://github.com/guocaoyi/create-chrome-ext'
  const INJECT_NAMES = ["starknet_rivet"]

  useEffect(() => {
    console.error('start');
    INJECT_NAMES.forEach((name) => {
      try {
        delete (window as any)[name]
      } catch (e) {
      }
      try {
        Object.defineProperty(window, name, {
          value: starknetWindowObject,
          writable: false,
        })
      } catch {
      }
      try {
        ;(window as any)[name] = starknetWindowObject
      } catch {
      }
    })
    console.error('start: ', window.starknet_rivet);
    let intervalId = setInterval(() => {
      setTime(getTime())
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  return (
    <section>
      <span></span>
      <h1>Demo Screen1</h1>
      <DockerCommandGenerator />
      <title>Display Accounts</title>
      <button onClick={() => connect()}>Connect wallet</button>
      <PredeployedAccounts />
    </section>
  )
}

export default Screen1


