import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

// ===== أنواع الأخطاء =====
export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'AuthError'
  }
}

// ===== التحقق من صحة البريد الإلكتروني =====
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ===== التحقق من صحة كلمة المرور =====
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل')
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رمز خاص واحد (!@#$%^&*)')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ===== التحقق من صحة رقم الهاتف =====
export const validatePhone = (phone: string): boolean => {
  // قبول أرقام هاتف سعودية وأرقام دولية
  const phoneRegex = /^(\+966|966|0)?[5][0-9]{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// ===== التحقق من صحة الاسم =====
export const validateFullName = (name: string): boolean => {
  return name.trim().length >= 3 && name.trim().length <= 100
}

// ===== تسجيل دخول المستخدم =====
export const userLogin = async (email: string, password: string) => {
  try {
    // التحقق من صحة البيانات
    if (!email || !password) {
      throw new AuthError('البريد الإلكتروني وكلمة المرور مطلوبة', 'MISSING_FIELDS')
    }

    if (!validateEmail(email)) {
      throw new AuthError('البريد الإلكتروني غير صحيح', 'INVALID_EMAIL')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new AuthError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'INVALID_CREDENTIALS')
      }
      throw new AuthError(error.message, 'LOGIN_ERROR')
    }

    // جلب بيانات المستخدم من جدول users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user?.id)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      throw new AuthError(userError.message, 'USER_FETCH_ERROR')
    }

    return {
      user: data.user,
      session: data.session,
      profile: userData || null,
    }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError('حدث خطأ في تسجيل الدخول', 'UNKNOWN_ERROR')
  }
}

// ===== تسجيل مستخدم جديد =====
export const userRegister = async (
  email: string,
  password: string,
  passwordConfirm: string,
  fullName: string,
  phone: string
) => {
  try {
    // التحقق من جميع الحقول
    if (!email || !password || !passwordConfirm || !fullName || !phone) {
      throw new AuthError('جميع الحقول مطلوبة', 'MISSING_FIELDS')
    }

    // التحقق من صحة البريد الإلكتروني
    if (!validateEmail(email)) {
      throw new AuthError('البريد الإلكتروني غير صحيح', 'INVALID_EMAIL')
    }

    // التحقق من تطابق كلمات المرور
    if (password !== passwordConfirm) {
      throw new AuthError('كلمات المرور غير متطابقة', 'PASSWORD_MISMATCH')
    }

    // التحقق من صحة كلمة المرور
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      throw new AuthError(
        'كلمة المرور ضعيفة: ' + passwordValidation.errors.join(', '),
        'WEAK_PASSWORD'
      )
    }

    // التحقق من صحة الاسم
    if (!validateFullName(fullName)) {
      throw new AuthError('الاسم يجب أن يكون بين 3 و 100 حرف', 'INVALID_NAME')
    }

    // التحقق من صحة رقم الهاتف
    if (!validatePhone(phone)) {
      throw new AuthError('رقم الهاتف غير صحيح (يجب أن يكون رقم سعودي)', 'INVALID_PHONE')
    }

    // التحقق من عدم وجود بريد مكرر
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      throw new AuthError('هذا البريد الإلكتروني مسجل بالفعل', 'EMAIL_EXISTS')
    }

    // إنشاء حساب Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      throw new AuthError(authError.message, 'SIGNUP_ERROR')
    }

    if (!authData.user?.id) {
      throw new AuthError('فشل إنشاء الحساب', 'NO_USER_ID')
    }

    // إضافة بيانات المستخدم في جدول users
    const { error: insertError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: email.toLowerCase(),
      full_name: fullName.trim(),
      phone: phone.replace(/\s/g, ''),
    })

    if (insertError) {
      // حذف حساب Auth إذا فشلت إضافة البيانات
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new AuthError(insertError.message, 'PROFILE_INSERT_ERROR')
    }

    return {
      user: authData.user,
      message: 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني',
    }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError('حدث خطأ في التسجيل', 'UNKNOWN_ERROR')
  }
}

// ===== تسجيل دخول المسؤول =====
export const adminLogin = async (password: string): Promise<boolean> => {
  try {
    if (!password) {
      throw new AuthError('كلمة المرور مطلوبة', 'MISSING_PASSWORD')
    }

    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    if (!adminPassword) {
      throw new AuthError('كلمة مرور المسؤول غير مكونة', 'ADMIN_PASSWORD_NOT_SET')
    }

    // حفظ token في localStorage للجلسة
    if (password === adminPassword) {
      const token = Buffer.from(`admin:${Date.now()}`).toString('base64')
      localStorage.setItem('admin_token', token)
      localStorage.setItem('admin_login_time', Date.now().toString())
      return true
    }

    throw new AuthError('كلمة المرور غير صحيحة', 'INVALID_ADMIN_PASSWORD')
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError('حدث خطأ في تسجيل دخول المسؤول', 'UNKNOWN_ERROR')
  }
}

// ===== التحقق من جلسة المسؤول =====
export const isAdminLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false

  const token = localStorage.getItem('admin_token')
  const loginTime = localStorage.getItem('admin_login_time')

  if (!token || !loginTime) return false

  // انتهاء الجلسة بعد 24 ساعة
  const currentTime = Date.now()
  const sessionDuration = 24 * 60 * 60 * 1000 // 24 ساعة

  if (currentTime - parseInt(loginTime) > sessionDuration) {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_login_time')
    return false
  }

  return true
}

// ===== تسجيل الخروج =====
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw new AuthError(error.message, 'LOGOUT_ERROR')

    // حذف tokens المسؤول
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_login_time')

    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError('حدث خطأ في تسجيل الخروج', 'UNKNOWN_ERROR')
  }
}

// ===== الحصول على المستخدم الحالي =====
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw new AuthError(error.message, 'GET_USER_ERROR')

    if (!data.user) return null

    // جلب بيانات المستخدم الإضافية
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      throw new AuthError(profileError.message, 'PROFILE_FETCH_ERROR')
    }

    return {
      user: data.user,
      profile: profile || null,
    }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    return null
  }
}

// ===== إعادة تعيين كلمة المرور =====
export const resetPassword = async (email: string) => {
  try {
    if (!email) {
      throw new AuthError('البريد الإلكتروني مطلوب', 'MISSING_EMAIL')
    }

    if (!validateEmail(email)) {
      throw new AuthError('البريد الإلكتروني غير صحيح', 'INVALID_EMAIL')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) throw new AuthError(error.message, 'RESET_ERROR')

    return { message: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني' }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError('حدث خطأ في إعادة التعيين', 'UNKNOWN_ERROR')
  }
}

// ===== تحديث كلمة المرور =====
export const updatePassword = async (newPassword: string, confirmPassword: string) => {
  try {
    if (!newPassword || !confirmPassword) {
      throw new AuthError('كلمات المرور مطلوبة', 'MISSING_PASSWORD')
    }

    if (newPassword !== confirmPassword) {
      throw new AuthError('كلمات المرور غير متطابقة', 'PASSWORD_MISMATCH')
    }

    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      throw new AuthError(
        'كلمة المرور ضعيفة: ' + passwordValidation.errors.join(', '),
        'WEAK_PASSWORD'
      )
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw new AuthError(error.message, 'UPDATE_PASSWORD_ERROR')

    return { message: 'تم تحديث كلمة المرور بنجاح' }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError('حدث خطأ في تحديث كلمة المرور', 'UNKNOWN_ERROR')
  }
}
