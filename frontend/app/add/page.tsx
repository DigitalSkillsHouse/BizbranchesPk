"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ChevronsUpDown, MapPin, Building, User, Phone, Mail, MessageSquare, Globe, Camera, CheckCircle, Upload, Star, Shield, Zap } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cities } from "@/lib/mock-data"
import { slugify } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface FormState {
  businessName: string
  contactPersonName?: string
  category: string
  subCategory?: string
  country: string
  city: string
  postalCode?: string
  address: string
  phone: string
  whatsapp?: string
  email?: string
  description: string
  logoFile?: File | null
  websiteUrl?: string
  facebookUrl?: string
  gmbUrl?: string
  youtubeUrl?: string
  profileUsername?: string
}

export function AddBusinessForm({
  title = "Add Your Business Free",
  description = "Pakistan's free business listing directory. Get visibility in minutes.",
  categories = [],
  onSubmitted,
}: {
  title?: string
  description?: string
  categories?: string[]
  onSubmitted?: () => void
}) {
  const { toast } = useToast()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({})
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState(0)
  const DESCRIPTION_MAX = 1000
  const CACHE_TTL_MS = 60 * 60 * 1000

  const [localCategories, setLocalCategories] = useState<string[]>([])
  
  const fetchCategories = async () => {
    const now = Date.now()
    try {
      setCatLoading(true)
      try {
        const raw = sessionStorage.getItem("add:categories")
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed?.data) && typeof parsed?.ts === "number" && (now - parsed.ts) < CACHE_TTL_MS) {
            setLocalCategories(parsed.data)
          }
        }
      } catch {}

      const res = await fetch("/api/categories?limit=200&nocache=1", { cache: "no-store" })
      const data = await res.json().catch(() => ({}))
      const list: string[] = Array.isArray(data?.categories)
        ? data.categories.map((c: any) => c?.name || c?.slug).filter(Boolean)
        : []
      if (list.length) {
        setLocalCategories((prev) => {
          const prevSet = new Set(prev)
          const newSet = new Set(list)
          let differs = prevSet.size !== newSet.size
          if (!differs) { for (const s of newSet) { if (!prevSet.has(s)) { differs = true; break } } }
          if (differs) {
            try { sessionStorage.setItem("add:categories", JSON.stringify({ ts: now, data: list })) } catch {}
            return list
          }
          return prev
        })
      }
    } catch {
    } finally {
      setCatLoading(false)
    }
  }
  
  useEffect(() => {
    fetchCategories()
  }, [])
  
  const [catOpen, setCatOpen] = useState(false)
  const [catQuery, setCatQuery] = useState("")
  const [catLoading, setCatLoading] = useState(true)
  const filteredCategories = useMemo(() => {
    const q = catQuery.trim().toLowerCase()
    if (!q) return localCategories
    return localCategories.filter((c) => c.toLowerCase().includes(q))
  }, [catQuery, localCategories])

  useEffect(() => {
    if (catOpen) fetchCategories()
  }, [catOpen])
  
  const [subCatOpen, setSubCatOpen] = useState(false)
  const [subCatQuery, setSubCatQuery] = useState("")
  const [subCategoryOptions, setSubCategoryOptions] = useState<string[]>([])
  const [subCatLoading, setSubCatLoading] = useState(false)
  const filteredSubCategories = useMemo(() => {
    const q = subCatQuery.trim().toLowerCase()
    if (!q) return subCategoryOptions
    return subCategoryOptions.filter((s) => s.toLowerCase().includes(q))
  }, [subCatQuery, subCategoryOptions])
  
  // Country is fixed to Pakistan; no dropdown
  
  const [form, setForm] = useState<FormState>({
    businessName: "",
    contactPersonName: "",
    category: "",
    subCategory: "",
    country: "Pakistan",
    city: "",
    postalCode: "",
    address: "",
    phone: "",
    whatsapp: "",
    email: "",
    description: "",
    logoFile: null,
    websiteUrl: "",
    facebookUrl: "",
    gmbUrl: "",
    youtubeUrl: "",
    profileUsername: "",
  })

  const fetchSubcategories = async () => {
    const cat = form.category?.trim()
    if (!cat) {
      setSubCategoryOptions([])
      return
    }
    try {
      setSubCatLoading(true)
      const res = await fetch(`/api/categories?slug=${encodeURIComponent(slugify(cat))}`, { cache: "no-store" })
      const data = await res.json().catch(() => ({}))
      const list: string[] = Array.isArray(data?.category?.subcategories)
        ? data.category.subcategories.map((s: any) => s?.name || s?.slug).filter(Boolean)
        : []
      setSubCategoryOptions(list)
    } catch (e) {
      setSubCategoryOptions([])
    } finally {
      setSubCatLoading(false)
    }
  }

  useEffect(() => { fetchSubcategories() }, [form.category])
  useEffect(() => { if (subCatOpen) fetchSubcategories() }, [subCatOpen])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "categories:version") {
        fetchCategories()
        fetchSubcategories()
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchCategories()
        fetchSubcategories()
      }
    }
    window.addEventListener("storage", onStorage)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.removeEventListener("storage", onStorage)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  const completionPercentage = useMemo(() => {
    const requiredFields = [
      form.businessName,
      form.category,
      form.country,
      form.city,
      form.address,
      form.phone,
      form.description,
      form.logoFile
    ];
    
    const filledCount = requiredFields.filter(field => 
      field !== null && field !== undefined && field !== ''
    ).length;
    
    return Math.round((filledCount / requiredFields.length) * 100);
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setForm((prev) => ({ ...prev, [id]: value }))
    if (fieldErrors[id]) {
      setFieldErrors(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setForm((prev) => ({ ...prev, logoFile: file }))
    if (file) {
      const url = URL.createObjectURL(file)
      setLogoPreview(url)
    } else {
      setLogoPreview(null)
    }
  }

  const validate = () => {
    const friendlyLabels: Record<string, { label: string; inputId: string }> = {
      businessName: { label: "Business Name", inputId: "businessName" },
      contactPersonName: { label: "Contact Person", inputId: "contactPersonName" },
      category: { label: "Category", inputId: "category" },
      country: { label: "Country", inputId: "country" },
      province: { label: "Province", inputId: "province" },
      city: { label: "City", inputId: "city" },
      address: { label: "Complete Address", inputId: "address" },
      phone: { label: "Phone Number", inputId: "phone" },
      email: { label: "Email Address", inputId: "email" },
      description: { label: "Business Description", inputId: "description" },
      logo: { label: "Business Logo", inputId: "logo" },
    }

    const required = [
      ["businessName", form.businessName],
      ["category", form.category],
      ["country", form.country],
      ["city", form.city],
      ["address", form.address],
      ["phone", form.phone],
      ["description", form.description],
    ] as const

    const missingKeys = required.filter(([, v]) => !v || String(v).trim() === "").map(([k]) => k as string)
    if (!form.logoFile) missingKeys.push("logo")

    const errors: Record<string, boolean> = {}
    missingKeys.forEach(key => { errors[key] = true })
    setFieldErrors(errors)

    if (missingKeys.length) {
      const friendlyList = missingKeys
        .map((k) => friendlyLabels[k]?.label || k)
        .join(", ")

      toast({
        title: "Please fill all required fields",
        description: friendlyList,
        variant: "destructive",
      })

      const firstKey = missingKeys[0]
      const inputId = friendlyLabels[firstKey]?.inputId || firstKey
      const el = document.getElementById(inputId)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
        ;(el as HTMLElement).focus?.()
      }
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append("name", form.businessName)
      if (form.contactPersonName) fd.append("contactPerson", form.contactPersonName)
      fd.append("category", form.category)
      if (form.subCategory) fd.append("subCategory", form.subCategory)
      if (form.country) fd.append("country", form.country)
      fd.append("city", form.city)
      if (form.postalCode) fd.append("postalCode", form.postalCode)
      fd.append("address", form.address)
      fd.append("phone", form.phone)
      fd.append("whatsapp", form.whatsapp || "")
      if (form.email) fd.append("email", form.email)
      fd.append("description", form.description)
      if (form.websiteUrl) fd.append("websiteUrl", form.websiteUrl)
      if (form.facebookUrl) fd.append("facebookUrl", form.facebookUrl)
      if (form.gmbUrl) fd.append("gmbUrl", form.gmbUrl)
      if (form.youtubeUrl) fd.append("youtubeUrl", form.youtubeUrl)
      if (form.profileUsername) fd.append("profileUsername", form.profileUsername)
      if (form.logoFile) {
        fd.append("logo", form.logoFile)
      }

      const res = await fetch("/api/business", {
        method: "POST",
        body: fd,
      })

      if (res.ok) {
        setForm({
          businessName: "",
          contactPersonName: "",
          category: "",
          subCategory: "",
          country: "",
          city: "",
          postalCode: "",
          address: "",
          phone: "",
          whatsapp: "",
          email: "",
          description: "",
          logoFile: null,
          websiteUrl: "",
          facebookUrl: "",
          gmbUrl: "",
          youtubeUrl: "",
          profileUsername: "",
        })
        setSubmitted(true)
        setShowSuccessDialog(true)
        onSubmitted?.()
      } else {
        let message = "Please try again."
        try {
          const data = await res.json()
          const details = Array.isArray(data?.details)
            ? data.details
                .map((d: any) => `${d?.path?.join?.('.') || d?.path || ''}: ${d?.message || d?.code || 'invalid'}`)
                .join("; ")
            : ""
          message = [data?.error, details].filter(Boolean).join(" — ") || JSON.stringify(data)
        } catch (_) {
          try {
            message = await res.text()
          } catch {}
        }
        toast({ title: `Submission failed (${res.status})`, description: message, variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Network error", description: "Please check your connection.", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page title and CTA */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
              {description}
            </p>
          </div>
          {/* Enhanced Progress Card */}
          <div className="mb-6 sm:mb-8 md:mb-10">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-gray-100/50 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Form Completion</h2>
                  <p className="text-sm sm:text-base text-gray-600">Fill in all required fields to complete your listing</p>
                </div>
                <div className="text-center sm:text-right flex-shrink-0">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                    {completionPercentage}%
                </div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">Complete</div>
              </div>
              </div>
              <div className="relative w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out shadow-lg"
                  style={{ width: `${completionPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            {submitting && (
              <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-lg flex flex-col items-center justify-center gap-6 rounded-3xl shadow-2xl">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-indigo-200 rounded-full"></div>
                  <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-2">Submitting your listing...</div>
                  <div className="text-gray-600">This will only take a moment</div>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <form onSubmit={handleSubmit} noValidate className="space-y-0" role="form" aria-label="Business listing registration form">
                {/* Basic Information */}
                <section className="p-4 sm:p-6 md:p-8 lg:p-10 border-b border-gray-100 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30">
                  <div className="flex items-start gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                      <Building className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Business Information</h2>
                      <p className="text-sm sm:text-base text-gray-600">Enter your business name, contact person, and email address</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-gray-700 font-semibold text-sm flex items-center gap-1">
                        Business Name <span className="text-red-500 text-lg">*</span>
                      </Label>
                        <Input 
                          id="businessName" 
                          name="businessName"
                        placeholder="e.g., ABC Restaurant, XYZ Services" 
                          value={form.businessName} 
                          onChange={handleChange} 
                          aria-describedby="businessName-help"
                        className={`h-12 border-2 rounded-lg transition-all ${fieldErrors.businessName ? 'border-red-400 bg-red-50/50' : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'} bg-white`}
                        />
                      <p id="businessName-help" className="text-xs text-gray-500">Official business name as on documents</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPersonName" className="text-gray-700 font-semibold text-sm">Contact Person</Label>
                      <Input 
                        id="contactPersonName" 
                        placeholder="Contact person name" 
                        value={form.contactPersonName} 
                        onChange={handleChange} 
                        className="h-12 border-2 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white transition-all" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-semibold text-sm">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="business@example.com" 
                        value={form.email} 
                        onChange={handleChange} 
                        className="h-12 border-2 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white transition-all" 
                      />
                    </div>
                  </div>
                </section>

                {/* Contact Information */}
                <section className="p-10 border-b border-gray-100 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30">
                  <div className="flex items-start gap-5 mb-8">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Phone className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">Contact Information</h3>
                      <p className="text-gray-600 text-base">How customers can reach you</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-semibold text-sm flex items-center gap-1">
                        Phone Number <span className="text-red-500 text-lg">*</span>
                      </Label>
                      <Input 
                        id="phone" 
                        placeholder="+92 3XX XXXXXXX (Pakistan)" 
                        value={form.phone} 
                        onChange={handleChange} 
                        className={`h-12 border-2 rounded-lg transition-all ${fieldErrors.phone ? 'border-red-400 bg-red-50/50' : 'border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'} bg-white`}
                        aria-describedby="phone-help"
                      />
                      <p id="phone-help" className="text-xs text-gray-500 mt-1">Include country code for Pakistan (+92)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="text-gray-700 font-semibold text-sm">WhatsApp Number</Label>
                      <Input 
                        id="whatsapp" 
                        placeholder="+92 3XX XXXXXXX (optional)" 
                        value={form.whatsapp} 
                        onChange={handleChange} 
                        className="h-12 border-2 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white transition-all" 
                      />
                    </div>
                  </div>
                </section>

                {/* Location & Category */}
                <section className="p-10 border-b border-gray-100 bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/30">
                  <div className="flex items-start gap-5 mb-8">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <MapPin className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">Location & Category</h3>
                      <p className="text-gray-600 text-base">Where your business is located and what it does</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {/* Country: Pakistan only (no dropdown) */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold text-sm flex items-center gap-1">Country</Label>
                      <div className="flex items-center gap-2 h-12 px-4 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-700 font-medium">
                        🇵🇰 Pakistan
                      </div>
                    </div>

                    {/* City: Loading from Leopard API */}
                    <div className="space-y-2 lg:col-span-2">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 sm:p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                              <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <Label className="text-gray-900 font-bold text-base flex items-center gap-2">
                                🇵🇰 Select Your Business City (Pakistan)
                                <span className="text-red-500 text-lg">*</span>
                              </Label>
                            </div>
                          </div>
                          <Select value={form.city || ""} onValueChange={(v) => setForm((s) => ({ ...s, city: v }))}>
                            <SelectTrigger className={`w-full h-14 rounded-lg border-2 transition-all ${fieldErrors.city ? 'border-red-400 bg-red-50/50' : 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'} bg-white shadow-sm hover:shadow-md`}>
                              <SelectValue placeholder="Select your city" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {cities.map((city) => (
                                <SelectItem key={city.slug} value={city.name}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-gray-700 font-semibold text-sm">Postal/ZIP Code</Label>
                      <Input
                        id="postalCode"
                        placeholder="e.g. 10001, SW1A 1AA, 75001"
                        value={form.postalCode}
                        onChange={handleChange}
                        className="h-12 border-2 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold text-sm flex items-center gap-1">Category <span className="text-red-500 text-lg">*</span></Label>
                      <Popover open={catOpen} onOpenChange={setCatOpen}>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" role="combobox" aria-expanded={catOpen} className={`w-full justify-between h-12 rounded-lg border-2 transition-all ${fieldErrors.category ? 'border-red-400 bg-red-50/50' : 'border-gray-200 focus:border-blue-500'} bg-white`}>
                            <span className="truncate">{form.category ? form.category : (catLoading ? "Loading..." : "Select category")}</span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command shouldFilter={false}>
                            <CommandInput placeholder="Search category..." value={catQuery} onValueChange={setCatQuery} className="h-9" />
                            <CommandEmpty>
                              {catLoading ? "Loading..." : "No categories found."}
                            </CommandEmpty>
                            <CommandList>
                              <CommandGroup heading="Categories">
                                {filteredCategories.map((c) => (
                                  <CommandItem
                                    key={c}
                                    value={c}
                                    onSelect={(val) => {
                                      setForm((p) => ({ ...p, category: val, subCategory: "" }))
                                      setCatOpen(false)
                                      setCatQuery("")
                                    }}
                                  >
                                    {c}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold text-sm">Sub Category</Label>
                      <Popover open={subCatOpen} onOpenChange={setSubCatOpen}>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" role="combobox" aria-expanded={subCatOpen} className="w-full justify-between h-12 rounded-lg border-2 border-gray-200 focus:border-blue-500 bg-white transition-all" disabled={!form.category}>
                            <span className="truncate">{form.subCategory || (subCatLoading ? "Loading..." : "Select sub category")}</span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command shouldFilter={false}>
                            <CommandInput placeholder="Search sub category..." value={subCatQuery} onValueChange={setSubCatQuery} className="h-9" />
                            <CommandEmpty>
                              {subCatLoading ? "Loading..." : "No sub categories found."}
                            </CommandEmpty>
                            <CommandList>
                              <CommandGroup heading="Sub Categories">
                                {filteredSubCategories.map((s) => (
                                  <CommandItem
                                    key={s}
                                    value={s}
                                    onSelect={(val) => {
                                      setForm((p) => ({ ...p, subCategory: val }))
                                      setSubCatOpen(false)
                                      setSubCatQuery("")
                                    }}
                                  >
                                    {s}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <Label htmlFor="address" className="text-gray-700 font-semibold text-sm flex items-center gap-1">
                      Complete Address <span className="text-red-500 text-lg">*</span>
                    </Label>
                    <Input 
                      id="address" 
                      placeholder="Street address, building, floor, etc." 
                      value={form.address} 
                      onChange={handleChange} 
                      className={`h-12 border-2 rounded-lg transition-all ${fieldErrors.address ? 'border-red-400 bg-red-50/50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'} bg-white`}
                    />
                  </div>
                </section>

                {/* Business Description & Logo */}
                <section className="p-10 border-b border-gray-100 bg-gradient-to-br from-purple-50/50 via-white to-pink-50/30">
                  <div className="flex items-start gap-5 mb-8">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <User className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">Business Details</h3>
                      <p className="text-gray-600 text-base">Tell us about your business and upload your logo</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-gray-700 font-semibold text-sm flex items-center gap-1">
                        Business Description <span className="text-red-500 text-lg">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your business, services, and what makes you unique..."
                        value={form.description}
                        onChange={handleChange}
                        maxLength={DESCRIPTION_MAX}
                        rows={5}
                        className={`border-2 rounded-lg resize-none transition-all ${fieldErrors.description ? 'border-red-400 bg-red-50/50' : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'} bg-white`}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Describe your business and services</span>
                        <span className="font-medium">{form.description.length}/{DESCRIPTION_MAX}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo" className="text-gray-700 font-semibold text-sm flex items-center gap-1">
                        Business Logo <span className="text-red-500 text-lg">*</span>
                      </Label>
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="relative flex-1 w-full">
                          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${fieldErrors.logo ? 'border-red-400 bg-red-50/50' : 'border-gray-300 hover:border-purple-400 bg-gray-50/50 hover:bg-gray-50'}`}>
                            <div className="flex flex-col items-center">
                              <Upload className="h-10 w-10 text-gray-400 mb-3" />
                              <div className="text-base font-semibold text-gray-900 mb-1">Upload business logo</div>
                              <div className="text-sm text-gray-600 mb-4">JPG, PNG, WebP or SVG. Max 2.5MB</div>
                              <Button type="button" variant="outline" size="sm" className="pointer-events-none">
                                Choose File
                              </Button>
                            </div>
                            <Input 
                              id="logo" 
                              type="file" 
                              accept="image/png,image/jpeg,image/webp,image/svg+xml" 
                              onChange={handleFile} 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                        {logoPreview && (
                          <div className="flex-shrink-0">
                            <div className="w-32 h-32 rounded-xl border-2 border-gray-200 overflow-hidden bg-white shadow-lg">
                              <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Digital Presence */}
                <section className="p-10 border-b border-gray-100 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30">
                  <div className="flex items-start gap-5 mb-8">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Globe className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">Digital Presence</h3>
                      <p className="text-gray-600 text-base">Connect your online profiles (Optional)</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl" className="text-gray-700 font-semibold text-sm">Website URL</Label>
                      <Input 
                        id="websiteUrl" 
                        placeholder="https://www.example.com" 
                        value={form.websiteUrl} 
                        onChange={handleChange} 
                        className="h-12 border-2 rounded-lg border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebookUrl" className="text-gray-700 font-semibold text-sm">Facebook Page</Label>
                      <Input 
                        id="facebookUrl" 
                        placeholder="https://facebook.com/yourpage" 
                        value={form.facebookUrl} 
                        onChange={handleChange} 
                        className="h-12 border-2 rounded-lg border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gmbUrl" className="text-gray-700 font-semibold text-sm">Google Business Profile</Label>
                      <Input 
                        id="gmbUrl" 
                        placeholder="https://maps.google.com/?cid=..." 
                        value={form.gmbUrl} 
                        onChange={handleChange} 
                        className="h-12 border-2 rounded-lg border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtubeUrl" className="text-gray-700 font-semibold text-sm">YouTube Channel</Label>
                      <Input 
                        id="youtubeUrl" 
                        placeholder="https://youtube.com/@yourchannel" 
                        value={form.youtubeUrl} 
                        onChange={handleChange} 
                        className="h-12 border-2 rounded-lg border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white transition-all" 
                      />
                    </div>
                  </div>
                </section>

                {/* Submit Button */}
                <div className="p-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
                  <div className="max-w-2xl mx-auto text-center">
                    <Button
                      type="submit"
                      className="w-full md:w-auto min-h-[48px] px-8 sm:px-12 py-4 text-base sm:text-lg font-bold bg-white text-indigo-600 hover:bg-gray-50 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-xl mb-6 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
                      disabled={submitting}
                      aria-busy={submitting}
                    >
                      {submitting ? (
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" aria-hidden />
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Star className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
                          <span>Add Your Business Free</span>
                          <Star className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
                        </div>
                      )}
                    </Button>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20">
                      <p className="text-white font-semibold text-sm sm:text-base">
                        Your listing will be reviewed and published within 24–48 hours. Free forever.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <DialogTitle className="text-2xl font-bold text-green-800">
                  Business Submitted Successfully!
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-2">
                  Thank you! Your business has been submitted and will be reviewed within 24–48 hours. You'll receive an email confirmation once it's approved.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center pt-6">
                <Button 
                  onClick={() => {
                    setShowSuccessDialog(false)
                    router.push('/')
                  }}
                  className="w-full gradient-primary"
                >
                  Return to Home
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

export default function AddBusinessPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "List Your Business",
            "description": "Add your business to the directory for free",
            "url": "https://biz-own.com/add",
            "mainEntity": {
              "@type": "Service",
              "name": "Business Listing Service",
              "description": "Free business directory listing service for businesses worldwide",
              "provider": {
                "@type": "Organization",
                "name": "BizDirectory"
              }
            }
          })
        }}
      />
      <AddBusinessForm />
    </>
  )
}