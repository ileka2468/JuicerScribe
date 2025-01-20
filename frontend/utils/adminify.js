require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function makeUserAdmin(userId) {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: {
      is_admin: true,
    },
  });

  if (error) {
    console.error("Error updating user:", error);
  } else {
    console.log("User updated successfully:", data);
  }
}
