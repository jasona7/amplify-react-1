import './App.css';
import { useState } from 'react'

import CeramicClient from '@ceramicnetwork/http-client'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'

import { EthereumAuthProvider, ThreeIdConnect } from '@3id/connect'
import { DID } from 'dids'
import { IDX } from '@ceramicstudio/idx'
import logo from './blockchain-wallet-logo.jpg'

const endpoint = "https://ceramic-clay.3boxlabs.com"

function App() {
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [loaded, setLoaded] = useState(false)

  async function connect() {
    const addresses = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })
    return addresses
  }

  async function readProfile() {
    const [address] = await connect()
    const ceramic = new CeramicClient(endpoint)
    const idx = new IDX({ ceramic })

    try {
      const data = await idx.get(
        'basicProfile',
        `${address}@eip155:1`
      )
      console.log('data: ', data)
      if (data.name) setName(data.name)
      if (data.avatar) setImage(data.avatar)
    } catch (error) {
      console.log('error: ', error)
      setLoaded(true)
    }
  }

  async function updateProfile() {
    const [address] = await connect()
    const ceramic = new CeramicClient(endpoint)
    const threeIdConnect = new ThreeIdConnect()
    const provider = new EthereumAuthProvider(window.ethereum, address)

    await threeIdConnect.connect(provider)

    const did = new DID({
      provider: threeIdConnect.getDidProvider(),
      resolver: {
        ...ThreeIdResolver.getResolver(ceramic)
      }
    })

    ceramic.setDID(did)
    await ceramic.did.authenticate()

    const idx = new IDX({ ceramic })

    await idx.set('basicProfile', {
      name,
      avatar: image
    })

    console.log("Profile updated!")
  }

  return (
    <div className="App">
      <img src={logo} alt="Integrblock logo" class="center" />
      <input placeholder="Name" onChange={e => setName(e.target.value)} />
      <input placeholder="Profile Image" onChange={e => setImage(e.target.value)} />
      <button onClick={updateProfile}>Set Profile</button>
      <button onClick={readProfile}>Read Profile</button>

      { name && <h3>{name}</h3> }
      { image && <img style={{ width: '400px' }} src={image} /> }
      {(!image && !name && loaded) && <h4>No profile, please create one...</h4>}
    </div>
  );
}

export default App;
/*
package.json

{
  "name": "decentralized-identity",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@3id/connect": "^0.1.6",
    "@ceramicnetwork/3id-did-resolver": "^1.2.7",
    "@ceramicnetwork/http-client": "^1.0.7",
    "@ceramicstudio/idx": "^0.12.1",
    "@testing-library/jest-dom": "^5.11.4",
    "@testing-library/react": "^11.1.0",
    "@testing-library/user-event": "^12.1.10",
    "dids": "^2.4.0",
    "ethers": "^5.4.4",
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "react-scripts": "4.0.3",
    "web-vitals": "^1.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
*/
