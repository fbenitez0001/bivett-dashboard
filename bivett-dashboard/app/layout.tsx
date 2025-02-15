import "./globals.css"
import { Inter } from "next/font/google"
import Image from "next/image"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Insurance Sales Dashboard",
  description: "A simple dashboard for insurance policy sales",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="fixed top-0 left-0 w-full p-4 z-50">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sfXO6xlhLkGJetRtgxGvHtaOS0wO72.png"
            alt="Bivett Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </header>
        <main className="pt-16">{children}</main>
      </body>
    </html>
  )
}

