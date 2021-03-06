import React, { createContext, useEffect, useState } from 'react'
import { parseCookies, setCookie } from 'nookies'

import config from '../../config'

export const themes = config.theme.themes
export const defaultTheme = config.theme.default

const defaultConfig = {
  cookieName: 'themeCookie',
  defaultMode: defaultTheme,
}

export const EdgeThemeContext = createContext({
  mode: defaultConfig.defaultMode,
  switchMode: () => {},
})

EdgeThemeContext.displayName = 'EdgeTheme'

export default (App, config) => {
  const mergedConfig = { ...defaultConfig, ...config }
  const { cookieName, defaultMode } = mergedConfig

  function EdgeTheme({ initialProps, ...props }) {
    const mode = props.mode
    const [state, setState] = useState({
      browserMode: defaultMode,
      mode,
      switchMode: (mode) => {
        setCookie(null, cookieName, mode, { path: '/' })
        setState((state) => {
          return {
            ...state,
            mode,
          }
        })
      },
    })

    useEffect(() => {
      const cooks = parseCookies()

      setState((state) => {
        return {
          ...state,
          mode: cooks['themeCookie'] || state.mode,
        }
      })
    }, [])
    // parseCookies()

    // useEffect(() => {
    // We could use something like : https://github.com/Assortment/darkmodejs/blob/master/index.js
    // and https://github.com/xeoneux/next-dark-mode/blob/master/packages/next-dark-mode/src/index.tsx
    // to control the default mode based on user preferences (dark, light)
    // but we want to have more options
    // }, [])

    return (
      <EdgeThemeContext.Provider value={state}>
        <App {...props} {...initialProps} />
      </EdgeThemeContext.Provider>
    )
  }

  /* EdgeTheme.getInitialProps = async ({ Component, ctx }) => {
    const initialProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {}

    if (typeof window === 'undefined') {
      const cookies = parseCookies(ctx)

      const modeCookie = cookies[defaultConfig.cookieName]
      

      // Load the stored mode from the cookie, otherwise set
      let mode = MODE.LIGHT

      if (typeof modeCookie !== 'undefined') {
        mode = modeCookie
      } else {
        setCookie(ctx, defaultConfig.cookieName, mode, { path: '/'})
      }

      
      return { mode, initialProps }
    }

    
    return { initialProps }
  }*/

  EdgeTheme.displayName = `withEdgeTheme(${
    App.displayName || App.name || 'App'
  })`

  return EdgeTheme
}
