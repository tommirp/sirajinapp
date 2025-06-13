import { supabase } from "../supabaseClient"

export async function canModifyPlan(plan) {
  const user = await getUserInfo();
  if (user.role === 'pimpinan_cabang') return true
  if (user.role === 'karyawan' && plan?.is_approved !== 1) return true
  return false
}

export async function canModifyActivity(plan) {
  const user = await getUserInfo();
  // Gunakan aturan yang sama seperti working_plan
  return canModifyPlan(user.role, plan)
}

export async function setUserInfo() {
    const { data: { user } } = await supabase.auth.getUser()

    // Cek apakah user sudah login
    if (!user) {
      return null
    }
    
    // Ambil User Role
    const usr_role = await supabase
      .from('registered_users')
      .select('*, branch: master_data(*)')
      .eq('email', user.email)
      .single()
    
    const usr = {
      userId: user.id,
      username: user.user_metadata.full_name || user.email,
      branch: usr_role.data.branch.master_name,
      branch_region: usr_role.data.branch.master_group,
      branch_code: usr_role.data.branch.master_code,
      email: user.email,
      role: usr_role.data.role
    }
    
    localStorage.setItem('userSession', JSON.stringify(usr))
    return true;
}

export async function getUserInfo() {
  return JSON.parse(localStorage.getItem('userSession') || '{}') || {};
}