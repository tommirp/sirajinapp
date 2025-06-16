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

export async function initLocalData() {
    const isSessionExist = (localStorage.getItem('userSession') || '').length ? true : false;
    const isUserListExist = (localStorage.getItem('usersList') || '').length ? true : false;

    if (!isSessionExist || !isUserListExist) {
      const { data: { user } } = await supabase.auth.getUser()
  
      // Cek apakah user sudah login
      if (!user) return null
      
      // Ambil User Role
      const usr_detail = await supabase
        .from('registered_users')
        .select('*, user_role: user_roles(*), area: master_data(*)')
        .eq('email', user.email)
        .single()

      if (usr_detail && usr_detail.data && usr_detail.data.full_name) {
        const usr = {
          userId: user.id,
          username: user.user_metadata.full_name || user.email,
          branch: usr_detail.data.area.master_name,
          branch_code: usr_detail.data.area.code,
          branch_parent_code: usr_detail.data.area.parent,
          email: user.email,
          role_detail: usr_detail.data.user_role
        }
        
        localStorage.setItem('userSession', JSON.stringify(usr))

        // get list of users for selections
        const { data: listOfUsers } = await supabase
          .from('registered_users')
          .select('*, user_role: user_roles(*), area: master_data(*)')
          .eq('area.parent', usr.branch_parent_code)
          .eq('is_active', 1);

        if (listOfUsers && listOfUsers.data && listOfUsers.data.id) {
          const listOfUsers_items = listOfUsers.map((item) => ({
            value: item.id,
            label: item.full_name,
            email: item.email,
            area: item.area.master_name,
            area_code: item.area.code,
            role: item.user_role.role_name, 
            role_code: item.user_role.code, 
          }));
      
          localStorage.setItem('usersList', JSON.stringify(listOfUsers_items));

        } else {
          return null
        }

      } else {
        return null
      }
    }
    return true;
}

export async function getUserInfo() {
  return JSON.parse(localStorage.getItem('userSession') || '{}') || {};
}

export async function getLocalData(field) {
  return field && field !== '' ? JSON.parse(localStorage.getItem(field)) : null;
}