"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { AuthService } from "@/services/auth.service"
import { useTranslation } from "@/lib/i18n/use-translation"

export function LoginForm() {
  const router = useRouter()
  const { tr, t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({ email: "", password: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      await AuthService.login({ email: formData.email, password: formData.password })
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">{tr(t.auth.email)}</Label>
        <Input id="email" type="email" placeholder={tr(t.auth.emailPlaceholder)}
          value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required className="h-11" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{tr(t.auth.password)}</Label>
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            {tr(t.auth.forgotPassword)}
          </Link>
        </div>
        <div className="relative">
          <Input id="password" type={showPassword ? "text" : "password"}
            placeholder={tr(t.auth.password)}
            value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required className="h-11 pr-10" />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <Button type="submit" className="w-full h-11" disabled={isLoading}>
        {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{tr(t.auth.signingIn)}</>) : tr(t.auth.signIn)}
      </Button>
    </form>
  )
}
