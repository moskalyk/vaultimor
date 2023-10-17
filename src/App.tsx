import React, { useState } from 'react'
import { useTheme, Button, Box, Modal, TextInput, Text, Spinner } from '@0xsequence/design-system'
import { sequence } from '0xsequence'
import { AnimatePresence } from 'framer-motion'
import { ethers, utils } from 'ethers'
import { abi } from './abi'

let circles: any = []
let lines: any = []
let time = 0

const VAULTIMOR_CONTRACT = '0xB9433dfCc18A9BF36e61a78E494D1acA68474e3a'; // <- change this

function App() {
  const [init, setInit] = useState(false)
  const [loggedIn, setLoggedIn] = useState<any>(false)
  const [isOpen, toggleModal] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [contractAddress, setContractAddress] = useState('')
  const [tokenID, setTokenID] = useState('')
  const [signature, setSignature] = useState('')

  const {setTheme, theme} = useTheme()

  sequence.initWallet({defaultNetwork: 'arbitrum-goerli'}) // <- and this

  function getRandomPointInSphere(R: number) {
      let theta = Math.random() * Math.PI;
      let phi = Math.random() * 2 * Math.PI;
      let r = R * Math.cbrt(Math.random());

      let x = r * Math.sin(theta) * Math.cos(phi);
      let y = r * Math.sin(theta) * Math.sin(phi);

      // Convert these to SVG coordinates, centering on the middle of the SVG
      x += 200;
      y = 200 - y;  // SVG's y axis is flipped

      return { x, y };
  }

  function plotPointsInSVG() {
      const R = 80;  // Radius for our visualization purpose
      const centerX: any= 200;
      const centerY: any = 200;
      for(let i = 0; i < 8; i++) {
          let point: any = getRandomPointInSphere(R);
          lines = [...lines, <line x1={centerX} y1={centerY} x2={point.x} y2={point.y} stroke={theme =='light' ? 'black' : 'white'} stroke-width="1" />]
          circles = [...circles, <circle cx={point.x} cy={point.y} r={Math.random()*8} stroke={theme =='light' ? 'black' : 'white'} fill=""/>]
      }
  }

  const connect = async () => {
    const wallet = sequence.getWallet();
    const details = await wallet.connect({app: 'vaultimor'})

    if((details).connected) {
      setLoggedIn(true)
    }
  }

  const getArrayValueAtIndex = async () => {
    // Connect to a provider
    let provider = new ethers.providers.JsonRpcProvider("https://nodes.sequence.app/arbitrum-goerli"); // <- and this

    // Create a contract instance
    const contract = new ethers.Contract(VAULTIMOR_CONTRACT, abi, provider);

    let value = await contract.vaults(0);
    console.log(value.toString());
  }

  React.useState(() => {
    if(!init){
      setInit(true)
      setTheme('light')
      plotPointsInSVG();
    }

    // Example usage:
    getArrayValueAtIndex();
  })

  const openModal = () => {
    toggleModal(true)
  }
  
  const handleSigning = async () => {
    const wallet = await sequence.getWallet()
    const signer = await wallet.getSigner(137)
    // bytes memory data = abi.encodePacked(_vaulter, _contractAddress, _tokenID, _recipient, _time);
    time = Math.floor(Date.now() / 1000)+100
    const hash = utils.solidityPack(['address','address', 'uint', 'address', 'uint'], [await wallet.getAddress(), contractAddress, tokenID, await wallet.getAddress(), time])
    const _signature = await signer.signMessage(hash, {chainId: 137})
    console.log(_signature)
    setSignature(_signature)
  }

  const approve = async () => {
    const wallet = await sequence.getWallet()

    // ABI for the ERC-721 approve function
    const erc721Abi = [
      'function approve(address to, uint256 tokenId) external'
    ];

    const erc721Interface = new utils.Interface(erc721Abi);

    // Example of encoding the approve function
    const toAddress = VAULTIMOR_CONTRACT;  // The address you're approving
    const data = erc721Interface.encodeFunctionData('approve', [toAddress, tokenID]);

    console.log(data);

    const tx = {
      to: contractAddress,
      data
    }

    const ercVaultimorAbi = [
      'function create(address _vaulter, address _contractAddress, uint _tokenID, address _recipient, uint _time, bytes calldata signature_) onlyMod external'
    ];

    const vaultimorInterface = new utils.Interface(ercVaultimorAbi);
    const data1 = vaultimorInterface.encodeFunctionData('create', [await wallet.getAddress(), contractAddress, tokenID, await wallet.getAddress(), time, signature]);

    const tx1 = {
      to: VAULTIMOR_CONTRACT,
      data: data1
    }

    const signer = wallet.getSigner(80001)
    const res = await signer.sendTransaction([tx, tx1])

    console.log(res)

    toggleModal(false)
    setSignature('')
    setTokenID('')
    setContractAddress('')
  }

  return (
    <div className='App'>
      {
        loggedIn 
        ? 
        <div style={{textAlign: 'center', margin: 'auto'}}>
            <br/>
            <br/>
            <Box>
              <Button label="create vault" onClick={openModal}/>
            </Box>
            <br/>
            <h1 style={{fontFamily: 'Tilt Neon', textAlign: 'center'}}>your vaults</h1>
            <br/>
            <p style={{fontFamily: 'Tilt Neon', textAlign: 'center'}}>nothing to show</p>
            <br/>
            <br/>  

        </div> 
        :  
        <>
          <div style={{textAlign: 'center', margin: 'auto'}}>
          {/* <Box gap='6'>
            <IconButton style={{position: 'fixed', top: '20px', right: '20px'}} icon={SunIcon} onClick={() => {
              setTheme(theme == 'dark' ? 'light' : 'dark')
              lines = []
              circles = []
              plotPointsInSVG();
            }}/>
          </Box> */}
            <br/>
            <br/>
            <br/>
            <h1 style={{fontFamily: 'Tilt Neon', textAlign: 'center'}}>vaultimor</h1>
            <p style={{fontFamily: 'Tilt Neon', textAlign: 'center'}}>store your collectible for a set period of time</p>
            <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg" id="svg" style={{marginTop: '-50px', marginBottom: '-50px'}}>
              {circles}
              {lines}
            </svg>
            <Box>
              <Button label="login" onClick={connect}/>
            </Box>
            <p style={{position: 'fixed', fontFamily: 'Tilt Neon', bottom: '10px', left: '0px'}}>currently vaulted: {8} collectible(s) &nbsp;&nbsp;&nbsp;&nbsp; total size: {941} kb(s) &nbsp;&nbsp;&nbsp;&nbsp; total time: {22.7} day(s)</p>
            <div>
            </div>
          </div>
        </>
      }
<AnimatePresence>
        {

          isOpen 
            && 
            <Modal  onClose={() => toggleModal(false)}>

                <Box
                  flexDirection="column"
                  justifyContent="space-between"
                  height="full"
                  padding="16"
                >
                    <Box marginTop="5" marginBottom="4">
                      <br/>
                      <Text variant="normal" color="text80">
                        Enter your the contract address and token id you want to vault, then sign the vault and approve our contract to hold the collectible
                      </Text>

                      <Box marginTop="6">
                        <TextInput
                          onChange={(ev: { target: { value: any } }) => {
                            setContractAddress(ev.target.value)
                          }}
                          // ref={inputRef}
                          // onBlur={() => setEmailWarning(!!email && !isEmailValid)}
                          // value={email}
                          placeholder="contract address"
                          required
                        />
                        <br/>
                        <TextInput
                          name="email"
                          type="email"
                          onChange={(ev: { target: { value: any } }) => {
                            setTokenID(ev.target.value)
                          }}
                          placeholder="token ID"
                          required
                        />
                        {/* {showEmailWarning && (
                          <Text as="p" variant="small" color="negative" marginY="2">
                            Invalid email address
                          </Text>
                        )} */}
                      </Box>
                      <Box gap="2" marginY="4" alignItems="center" justifyContent="center">
                        {showLoader ? (
                          <Spinner />
                        ) : (
                          <Button
                            variant="primary"
                            // width="1/4"
                            // disabled={!isEmailValid}
                            label="Sign Vault"
                            onClick={() => handleSigning()}
                            // data-id="continueButton"
                          />
                        )}
                        <br/>
                        <Button
                            variant="primary"
                            // width="1/4"
                            disabled={signature == ''}
                            label="Approve Contract"
                            onClick={() => approve()}
                            // data-id="continueButton"
                          />
                      </Box>
                    </Box>
                </Box>
            </Modal>
        }

          </AnimatePresence>
    </div>

  )
}

export default App
