import React, { useState } from 'react'
import { useTheme, Button, Box } from '@0xsequence/design-system'
import { sequence } from '0xsequence'

let circles: any = []
let lines: any = []

function App() {
  const [init, setInit] = useState(false)
  const [loggedIn, setLoggedIn] = useState<any>(false)
  const {setTheme, theme} = useTheme()

  sequence.initWallet({defaultNetwork: 'arbitrum'})

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

  React.useState(() => {
    if(!init){
      setInit(true)
      setTheme('light')
      plotPointsInSVG();
    }
  })

  return (
    <div className='App'>
      {
        loggedIn 
        ? 
        <>
            <br/>
            <br/>
            <br/>
            <h1 style={{fontFamily: 'Tilt Neon', textAlign: 'center'}}>your vaults</h1>
            <p style={{fontFamily: 'Tilt Neon', textAlign: 'center'}}>nothing to show</p>
        </> 
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

    </div>

  )
}

export default App
