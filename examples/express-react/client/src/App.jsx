import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ConfigurationObjectFeatureFlagProvider, FeatureManager } from "@microsoft/feature-management"

function App() {
  const [betaEnabled, setBetaEnabled] = useState(false);
  const [targeted, setTargeted] = useState(false);
  const [fontColor, setFontColor] = useState("black");
  
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const userid = queryParams.get("userid");
    const groups = queryParams.get("group") ? queryParams.get("group").split(",") : [];

    const fetchFeatureFlags = async () => {
      try {
        const response = await fetch("http://localhost:5000/config");
        const data = await response.json();

        if (data.fontColor !== undefined) {
          setFontColor(data.fontColor);
        }
        
        const provider = new ConfigurationObjectFeatureFlagProvider(data);
        const featureManager = new FeatureManager(provider);
        
        const isBetaEnabled = await featureManager.isEnabled("Beta");
        setBetaEnabled(isBetaEnabled);

        const isTargeted = await featureManager.isEnabled("Targeting", { userId: userid, groups: groups });
        setTargeted(isTargeted);

      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchFeatureFlags();
  }, []);

  return (
    <>
      <div>
        {betaEnabled ? (
          <div>
            <a href="https://vitejs.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
        ) : (
          <div>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
        )}
      </div>
      {targeted ? (
        <div>
          {betaEnabled ? (
            <div style={{ color: fontColor }}>
              <h1>Vite + React</h1>
            </div>
          ) : (
            <div style={{ color: fontColor }}>
              <h1>React</h1>
            </div>
          )}
        </div>
      ) : (
        <div>
        </div>
      )}
    </>
  )
}

export default App
