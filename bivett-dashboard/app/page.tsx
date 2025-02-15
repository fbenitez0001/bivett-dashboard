"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_AUTH_PASSWORD) {
      setError(false)
      setIsOpen(false)
      // Set a cookie to maintain authentication state
      document.cookie = "auth=true; path=/; max-age=3600" // expires in 1 hour
      router.push("/dashboard")
    } else {
      setError(true)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Ingreso al Tablero Bivett</h1>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-[#e3e829] hover:bg-[#c5ca23] text-[#26328c] font-bold py-2 px-6 rounded-full text-lg transition-colors duration-300"
      >
        Ver tablero
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#00215C] text-white">
          <DialogHeader>
            <DialogTitle>Autenticación Requerida</DialogTitle>
            <DialogDescription className="text-gray-300">
              Por favor ingrese la palabra secreta para continuar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAuth} className="space-y-4">
            <Input
              type="password"
              placeholder="Palabra secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#0033A0] border-[#C5D92D] text-white placeholder:text-gray-400"
            />
            {error && <p className="text-red-500 text-sm">Palabra secreta incorrecta</p>}
            <Button type="submit" className="w-full bg-[#C5D92D] hover:bg-[#a8b824] text-[#26328c] font-bold">
              Ingresar
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}

