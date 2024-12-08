import React, { useState, useEffect } from 'react';
import { inBlacklist } from '~blacklist.util';

const DefaultPage: React.FC = () => {
  const [enabledOnDomain, setEnabledOnDomain] = useState<boolean>(true)

  const populateEnabledStatus = async () => {

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.id) {
        const fetchDomainResult = await chrome.tabs.sendMessage(tabs[0].id, { type: "fetchDomain" })
        if (fetchDomainResult) {
          const domain: string = fetchDomainResult.domain
          const isBlacklisted = await inBlacklist(domain)
          if (isBlacklisted === null) {
            // no result received from util function
            return
          }
          setEnabledOnDomain(!isBlacklisted)
        }
      }
    });

  }

  const handleRefreshButtonPress = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "refreshPage" });
      }
    });
  }


  useEffect(() => {
    populateEnabledStatus()
  }, [])

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.id) {
        const actionMsg: string = enabledOnDomain ? 'whitelistDomain' : 'blacklistDomain'
        chrome.tabs.sendMessage(tabs[0].id, { type: actionMsg })
      }
    });

  }, [enabledOnDomain])

  const toggleEnabled = () => {
    setEnabledOnDomain(currVal => (!currVal))
  }


  return (
    <div style={{ maxWidth: '200px', height: 'auto' }}>
      <label for='enabled_on_page'>Enabled on this site</label>
      <input name='enabled_on_page' type='checkbox' checked={enabledOnDomain} onClick={toggleEnabled} />
      <button onClick={handleRefreshButtonPress}>Reload</button>
    </div>
  )

}

export default DefaultPage
