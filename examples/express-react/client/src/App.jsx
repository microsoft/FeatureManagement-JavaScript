import { useState, useEffect } from 'react'
import reactLogo from '/react.svg'
import './App.css'
import { ConfigurationObjectFeatureFlagProvider, FeatureManager } from "@microsoft/feature-management"

function App() {
  const [betaEnabled, setBetaEnabled] = useState(false);
  const [targeted, setTargeted] = useState(false);
  const [appSettings, setAppSettings] = useState(undefined);
  
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const userid = queryParams.get("userid");
    const groups = queryParams.get("groups") ? queryParams.get("groups").split(",") : [];

    const fetchConfiguration = async () => {
      try {
        const response = await fetch("http://localhost:5000/config");
        const data = await response.json();

        if (data.app?.settings !== undefined) {
          setAppSettings(data.app.settings);
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

    fetchConfiguration();
  }, []);

  return (
    <>
      {betaEnabled ?
        <div>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        : null}
      {appSettings ?
        <div style={{ color: appSettings.fontColor, fontSize: appSettings.fontSize }}>
          Welcome to your React app!
        </div> : null
      }
      {targeted ?
        <div>
          <h1>User is targeted.</h1>
        </div>
      : null
      }
    </>
  )
}

export default App
