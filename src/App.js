// App.js
import React, { useEffect, useState } from 'react'
import './App.css'
import { ethers } from 'ethers'
import cDaiABI from './utils/cDaiABI.json'

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [tokenBalance, setTokenBalance] = useState(null)
  const [amount, setAmount] = useState('')

  // Compound Dai token address rinkeby network
  const CDAI_ADDRESS = '0x6d7f0754ffeb405d23c51ce938289d4835be3b14'

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window
    if (!ethereum) {
      console.log('Make sure you have metamask!')
      return
    } else {
      console.log('We have the ethereum object', ethereum)
    }
    // Check if we're authorized to access the user's wallet
    const accounts = await ethereum.request({ method: 'eth_accounts' })
    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log('Found an authorized account:', account)
      setCurrentAccount(account)
    } else {
      console.log('No authorized account found')
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  useEffect(() => {
    if (currentAccount) {
      const { ethereum } = window
      const provider = new ethers.providers.Web3Provider(ethereum)
      const DAI = new ethers.Contract(CDAI_ADDRESS, cDaiABI, provider)
      DAI.balanceOf(currentAccount).then(balance => {
        setTokenBalance(balance / 1e8)
      })
    }
  }, [currentAccount])

  const depositTokens = async amount => {
    console.log('Supplying ETH to the Compound Protocol...', '\n')
    const { ethereum } = window
    const provider = new ethers.providers.Web3Provider(ethereum)
    const DAI = new ethers.Contract(CDAI_ADDRESS, cDaiABI, provider.getSigner())
    const tx = await DAI.mint(ethers.utils.parseUnits(amount, 18))

    const txCompleted = await tx.wait()
    DAI.balanceOf(currentAccount).then(balance => {
      setTokenBalance(balance / 1e8)
    })
    console.log(
      'cETH "Mint" operation successful hash: ',
      txCompleted.transactionHash
    )
  }

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <div>Your cDAI balance: {tokenBalance}</div>
        <p>Deposit tokens</p>
        <input
          type="text"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <button onClick={() => depositTokens(amount)}>Deposit</button>
      </div>
    </div>
  )
}

export default App
