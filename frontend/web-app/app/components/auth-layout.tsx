"use client"

import type React from "react"

import Link from "next/link"
import { motion } from "framer-motion"
import { Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  backLinkText: string
  backLinkHref: string
  showSkip?: boolean
}

export function AuthLayout({
  children,
  title,
  subtitle,
  backLinkText,
  backLinkHref,
  showSkip = false,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left side - Animated background */}
      <div className="hidden md:flex relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-primary">
          <motion.div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(45deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Animated circles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: `${Math.random() * 300 + 100}px`,
                height: `${Math.random() * 300 + 100}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              initial={{
                scale: 0,
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50,
              }}
              animate={{
                scale: [0, 1, 1.1, 1],
                x: [Math.random() * 100 - 50, 0],
                y: [Math.random() * 100 - 50, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                repeatDelay: Math.random() * 5 + 5,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-white p-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-8"
          >
            <Briefcase className="h-12 w-12" />
            <h1 className="text-4xl font-bold">FindJob</h1>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center max-w-md"
          >
            <h2 className="text-2xl font-semibold mb-4">Найдите работу своей мечты</h2>
            <p className="text-white/80">
              Свяжитесь с ведущими работодателями и откройте для себя возможности, соответствующие вашим навыкам и стремлениям.
            </p>
          </motion.div>

          <motion.div
            className="mt-12 grid grid-cols-3 gap-4 w-full max-w-md"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {["Проекты", "Строительство", "Ремонт", "Инженерия", "Управление", "Экспертиза"].map((category, i) => (
              <motion.div
                key={category}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center transition-all duration-150"
                whileHover={{ 
                  scale: 1.1, 
                  backgroundColor: "rgba(255,255,255,0.2)",
                  transition: { duration: 0.2 }
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                {category}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-col justify-center p-6 sm:p-12">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <Briefcase className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">FindJob</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          <div className="text-center text-sm text-muted-foreground mt-6">
          {showSkip ? (
              <Button variant="link" asChild>
                <Link href={backLinkHref} className="hover:text-primary transition-colors">
                  {backLinkText}
                </Link>
              </Button>
            ) : (
              <Link href={backLinkHref} className="hover:text-primary transition-colors">
                {backLinkText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

