import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Dashboard from "./dashboard"

async function getData() {
  const { data, error } = await supabase
    .from("full_query_polizas")
    .select('created_at, "isAnualPlan", share_data, ciudad, lista_mascotas')
    .contains("share_data", { aliance: "bivett" })

  if (error) {
    console.error("Error fetching data:", error)
    return []
  }

  return data
}

export default async function DashboardPage() {
  const cookieStore = cookies()
  const isAuthenticated = cookieStore.get("auth")?.value === "true"

  if (!isAuthenticated) {
    redirect("/")
  }

  const data = await getData()
  return <Dashboard data={data} />
}

