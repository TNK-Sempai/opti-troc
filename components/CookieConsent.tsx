'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

const GA_ID = 'G-35NBENEDXF'

export default function CookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('cookie_consent')
    if (stored) setConsent(stored === 'accepted')
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    setConsent(true)
  }

  const refuseCookies = () => {
    localStorage.setItem('cookie_consent', 'refused')
    setConsent(false)
  }

  return (
    <>
      {/* GA4 chargé UNIQUEMENT si accepté */}
      {consent === true && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                anonymize_ip: true
              });
            `}
          </Script>
        </>
      )}

      {/* Bannière */}
      {consent === null && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black text-white p-4 text-sm">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
            <p>
              Nous utilisons des cookies à des fins de mesure d’audience.
              Vous pouvez accepter ou refuser.
            </p>

            <div className="flex gap-2">
              <button
                onClick={refuseCookies}
                className="border border-white px-4 py-2"
              >
                Refuser
              </button>
              <button
                onClick={acceptCookies}
                className="bg-white text-black px-4 py-2"
              >
                Accepter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
