"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "react-hot-toast"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { registerUser } from "@/app/actions/authActions"

export const formSchema = z.object({
  username: z.string().min(2, {
    message: "Имя пользователя должно содержать минимум 2 символа",
  }),
  email: z.string().email({
    message: "Введите корректный email",
  }),
  password: z.string().min(6, {
    message: "Пароль должен содержать минимум 6 символов",
  }),
  firstName: z.string().min(1, "Требуется имя"),
  lastName: z.string().min(1, "Требуется фамилия"),
  role: z.enum(["employer", "employee"], {
    required_error: "Пожалуйста, выберите роль",
  }),
  taxNumber: z.string().optional().refine((val) => {
    if (!val) return true;
    return /^\d{12}$/.test(val);
  }, {
    message: "ИНН должен содержать ровно 12 цифр",
  }),
})

export default function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showTaxId, setShowTaxId] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "employee",
      taxNumber: "",
    },
    mode: "onChange",
  })

  const {
    formState: { isValid, errors },
    trigger,
    getValues,
  } = form

  const handleNextStep = async () => {
    const fieldsToValidate = currentStep === 1 ? ["username", "email", "password"] : ["firstName", "lastName", "role"]
    const isStepValid = await trigger(fieldsToValidate as any)
    if (isStepValid) {
      setCurrentStep(2)
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(1)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      const user = await registerUser(values)
      router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`)
      toast.success('Регистрация успешна! Пожалуйста, проверьте вашу почту для подтверждения email.')
    } catch (error: any) {
      toast.error(error.message || 'Произошла ошибка при регистрации')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя пользователя</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите имя пользователя" {...field} />
                    </FormControl>
                    <FormDescription>Это будет ваш уникальный идентификатор на FindJob</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Введите ваш email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Создайте пароль" {...field} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Минимум 6 символов, заглавная буква, строчная буква и цифра
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleNextStep}
                  disabled={
                    !getValues("username") ||
                    !getValues("email") ||
                    !getValues("password") ||
                    !!errors.username ||
                    !!errors.email ||
                    !!errors.password
                  }
                >
                  Продолжить
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите ваше имя" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Фамилия</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите вашу фамилию" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Я хочу</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value)
                        setShowTaxId(value === "employer")
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите вашу роль" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employee">Найти работу (Соискатель)</SelectItem>
                        <SelectItem value="employer">Нанимать таланты (Работодатель)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Это определяет ваши возможности на платформе</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showTaxId && (
                <FormField
                  control={form.control}
                  name="taxNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>УНП</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Введите ваш УНП" 
                          {...field} 
                          maxLength={12}
                          pattern="[0-9]*"
                          inputMode="numeric"
                        />
                      </FormControl>
                      <FormDescription>Требуется для работодателей</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="w-1/2" onClick={handlePrevStep}>
                  Назад
                </Button>
                <Button type="submit" className="w-1/2" disabled={isLoading || !isValid}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Создание...
                    </>
                  ) : (
                    "Создать аккаунт"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </form>
      </Form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Создавая аккаунт, вы соглашаетесь с нашими{" "}
        <Button variant="link" className="p-0 h-auto text-sm">
          Условиями использования
        </Button>{" "}
        и{" "}
        <Button variant="link" className="p-0 h-auto text-sm">
          Политикой конфиденциальности
        </Button>
      </div>
    </motion.div>
  )
}

