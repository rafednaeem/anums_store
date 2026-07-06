import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember_me: z.boolean().optional(),
})

export const signupSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^(\+92|0)[0-9]{10}$/, "Please enter a valid Pakistani phone number")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
})

export const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
})

export const shippingSchema = z.object({
  guest_email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  full_name: z.string().min(2, "Name is required"),
  phone: z
    .string()
    .regex(/^(\+92|0)[0-9]{10}$/, "Please enter a valid Pakistani phone number"),
  address_line1: z.string().min(5, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  postal_code: z.string().optional(),
  save_address: z.boolean().optional(),
  address_label: z.string().optional(),
})

export const checkoutSchema = z.object({
  shipping: shippingSchema,
  payment_method: z.literal("bank_transfer"),
  notes: z.string().optional(),
})

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  category_id: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  compare_price: z.number().nullable().optional(),
  sale_price: z.number().nullable().optional(),
  is_on_sale: z.boolean().optional(),
  is_active: z.boolean().optional(),
  inventory_count: z.number().min(0).optional(),
  craft_type: z.string().optional(),
  cover_url: z.string().nullable().optional(),
  catalog_url: z.string().nullable().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.object({
    name: z.string(),
    hex: z.string(),
  })).optional(),
  gallery_urls: z.array(z.string()).optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().optional(),
  parent_id: z.string().nullable().optional(),
  sort_order: z.number().optional(),
  is_active: z.boolean().optional(),
})

export const reviewSchema = z.object({
  product_id: z.string().min(1),
  name: z.string().min(2, "Name is required"),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(10, "Review must be at least 10 characters"),
})

export const addressSchema = z.object({
  label: z.string().optional(),
  full_name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^(\+92|0)[0-9]{10}$/, "Invalid phone number"),
  address_line1: z.string().min(5, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  postal_code: z.string().optional(),
  is_default: z.boolean().optional(),
})

export const inquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  contact: z.string().min(5, "Contact is required").optional().or(z.literal("")),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export const settingsSchema = z.record(z.string(), z.string())

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type ShippingInput = z.infer<typeof shippingSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type InquiryInput = z.infer<typeof inquirySchema>
