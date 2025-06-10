import { supabase } from "../supabaseClient"

export function canModifyPlan(plan) {
  const user = getUserInfo();
  if (user.role === 'pimpinan_cabang') return true
  if (user.role === 'karyawan' && plan?.is_approved !== 1) return true
  return false
}

export function canModifyActivity(plan) {
  const user = getUserInfo();
  // Gunakan aturan yang sama seperti working_plan
  return canModifyPlan(user.role, plan)
}

export async function getUserInfo() {
  const { data: { user } } = await supabase.auth.getUser()
    // Cek apakah user sudah login
    if (!user) {
      return null
    }

    // Ambil User Role
    const usr_role = await supabase
      .from('registered_users')
      .select('*')
      .eq('email', user.email)
      .single()

    if (usr_role.status !== 200 || !usr_role.data) {
      await supabase.functions.invoke('check-user-login', { body: { user: { id: user.id, email: user.email } } })
      return null
    }
    
    return {
      userId: user.id,
      username: user.user_metadata.full_name || user.email,
      email: user.email,
      role: usr_role.data.role
    }
}