"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "react-hot-toast"
import { motion } from "framer-motion"
import { Loader2, MapPin, Phone, FileText, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RegisterRole } from "@/types"
import LocationInput from "@/app/components/location-input"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { updateUserProfile } from "@/app/actions/userActions"
import { useLocationStore } from "@/app/hooks/useLocationStore"
import { getCurrentUser, getUserByUsername } from "@/app/actions/authActions"

const formSchema = z.object({
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  about: z.string().max(500, "Описание должно быть не более 500 символов").optional(),
  profilePicture: z.string().optional(),
})

export default function ProfileCompletionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as RegisterRole) || RegisterRole.EMPLOYEE
  const id = searchParams.get("id")
  const username = searchParams.get("username") ?? ""
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const { selectedLocation, setSelectedLocation } = useLocationStore()
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
      location: "",
      about: "",
      profilePicture: "",
    },
  });

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoadingUser(true);
        const user = await getUserByUsername(username)
        
        if (user) {
          // Set form values from user data
          form.setValue('phoneNumber', user.phoneNumber || "");
          form.setValue('about', user.about || "");
          
          // Set location in the store if location data is available
          if (user.location) {
            setSelectedLocation({
              city: user.location.city || "",
              country: user.location.country || "",
              street: user.location.street || "",
              latitude: typeof user.location.latitude === 'string' 
                ? parseFloat(user.location.latitude) 
                : (user.location.latitude || 0),
              longitude: typeof user.location.longitude === 'string' 
                ? parseFloat(user.location.longitude) 
                : (user.location.longitude || 0),
            });
            
            form.setValue('location', `${user.location.city || ""}, ${user.location.country || ""}`);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error("Не удалось загрузить данные пользователя");
      } finally {
        setIsLoadingUser(false);
      }
    };
    
    fetchUserData();
  }, [form, setSelectedLocation]);

  // Calculate completion percentage based on filled fields
  const calculateProgress = () => {
    const values = form.getValues()
    const totalFields = 3
    let filledFields = 0

    if (values.phoneNumber) filledFields++
    if (values.location) filledFields++
    if (values.about) filledFields++

    const percentage = (filledFields / totalFields) * 100
    setProgress(percentage)
  }

  // Update progress when form values change
  form.watch(() => calculateProgress())

  // Calculate initial progress
  useEffect(() => {
    calculateProgress();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Пожалуйста, загрузите изображение")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Размер изображения должен быть менее 5MB")
      return
    }

    setUploadingImage(true)

    // Simulate upload with a delay
    setTimeout(() => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
        form.setValue("profilePicture", e.target?.result as string)
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    }, 1500)
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      // Get the user ID from the URL
      const userId = searchParams.get("id");
      if (!userId) {
        toast.error("User ID not found");
        return;
      }
      
      // Create a structured location object if location is selected
      let locationData = undefined;
      if (selectedLocation) {
        locationData = {
          country: selectedLocation.country,
          city: selectedLocation.city,
          street: selectedLocation.street,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        };
      }
      
      // Prepare the profile data to be sent
      const profileData = {
        phoneNumber: data.phoneNumber,
        location: locationData,
        about: data.about,
      };
      
      console.log("Submitting profile data:", profileData);
      
      // Update the user profile and get the updated data
      const updatedSessionFields = await updateUserProfile(userId, profileData);
      
      console.log("Received updated fields from server action:", updatedSessionFields);

      toast.success("Profile updated successfully");
      
      // Navigate back to profile page
      router.push('/profile');
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Заполнение профиля</span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="mb-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileImage || ""} />
              <AvatarFallback>
                <User className="h-12 w-12 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>

            {uploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            <div className="absolute -bottom-2 -right-2">
              <Label
                htmlFor="profile-picture"
                className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors"
              >
                +
              </Label>
              <Input
                id="profile-picture"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Загрузите фото профиля</p>
        </div>
      </div>

      {isLoadingUser ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Загрузка данных пользователя...</span>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Номер телефона
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Введите ваш номер телефона" {...field} />
                  </FormControl>
                  <FormDescription>Мы будем использовать его для связи с Вами</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Местоположение
                  </FormLabel>
                  <FormControl>
                    <LocationInput />
                  </FormControl>
                  <FormDescription>Где вы находитесь? Это поможет найти подходящие вакансии рядом</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    О себе
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        role === RegisterRole.EMPLOYER ? "Расскажите о вашей компании..." : "Расскажите о себе..."
                      }
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{form.getValues("about")?.length || 0}/500 символов</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  "Завершить профиль"
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </motion.div>
  )
} 