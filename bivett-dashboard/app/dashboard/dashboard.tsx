"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
} from "recharts"

type Pet = {
  specie: string
  plan: string
  // Add other pet properties as needed
}

type PetPricing = {
  rc: boolean
  pricesOfPlans: {
    plan: string
    pricePlanAnual: number
    pricePlanMonthly: number
    pricePlanAnualRc: number
    pricePlanMonthlyRc: number
  }
}

type PetWithPricing = Pet & PetPricing

type Policy = {
  created_at: string
  isAnualPlan: boolean
  share_data:
    | {
        canal: string
        aliance: string
        numCotization: string
      }
    | string
  ciudad: string
  lista_mascotas: Pet[] | string
}

type ChartData = {
  month: string
  annual: number
  nonAnnual: number
  total: number
}

type RevenueChartData = {
  month: string
  revenue: number
}

type PlanData = {
  name: string
  value: number
}

function processData(data: Policy[]): ChartData[] {
  const monthlyData: { [key: string]: { annual: number; nonAnnual: number } } = {}

  data.forEach((policy) => {
    const date = new Date(policy.created_at)
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { annual: 0, nonAnnual: 0 }
    }

    if (policy.isAnualPlan) {
      monthlyData[monthYear].annual++
    } else {
      monthlyData[monthYear].nonAnnual++
    }
  })

  return Object.entries(monthlyData)
    .map(([month, counts]) => ({
      month,
      annual: counts.annual,
      nonAnnual: counts.nonAnnual,
      total: counts.annual + counts.nonAnnual,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

function calculateTotalRevenue(data: Policy[]): number {
  return data.reduce((total, policy) => {
    try {
      const pets = Array.isArray(policy.lista_mascotas)
        ? policy.lista_mascotas
        : JSON.parse(policy.lista_mascotas as string)

      const petsRevenue = pets.reduce((petTotal: number, pet: any) => {
        const { rc, pricesOfPlans } = pet
        const { pricePlanAnual, pricePlanMonthly, pricePlanAnualRc, pricePlanMonthlyRc } = pricesOfPlans

        let petRevenue = 0
        if (rc) {
          petRevenue = policy.isAnualPlan ? pricePlanAnualRc : pricePlanMonthlyRc * 12
        } else {
          petRevenue = policy.isAnualPlan ? pricePlanAnual : pricePlanMonthly * 12
        }

        return petTotal + petRevenue
      }, 0)

      return total + petsRevenue
    } catch (error) {
      return total
    }
  }, 0)
}

function processRevenueData(data: Policy[]): RevenueChartData[] {
  const monthlyRevenue: { [key: string]: number } = {}

  data.forEach((policy) => {
    const date = new Date(policy.created_at)
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    if (!monthlyRevenue[monthYear]) {
      monthlyRevenue[monthYear] = 0
    }

    try {
      const pets = Array.isArray(policy.lista_mascotas)
        ? policy.lista_mascotas
        : JSON.parse(policy.lista_mascotas as string)

      const policyRevenue = pets.reduce((total: number, pet: any) => {
        const { rc, pricesOfPlans } = pet
        const { pricePlanAnual, pricePlanMonthly, pricePlanAnualRc, pricePlanMonthlyRc } = pricesOfPlans

        let petRevenue = 0
        if (rc) {
          petRevenue = policy.isAnualPlan ? pricePlanAnualRc : pricePlanMonthlyRc * 12
        } else {
          petRevenue = policy.isAnualPlan ? pricePlanAnual : pricePlanMonthly * 12
        }

        return total + petRevenue
      }, 0)

      monthlyRevenue[monthYear] += policyRevenue
    } catch (error) {
      // Skip this policy if there's an error
    }
  })

  return Object.entries(monthlyRevenue)
    .map(([month, revenue]) => ({
      month,
      revenue,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

const SURA_COLORS = {
  primaryBlue: "#0033A0",
  secondaryBlue: "#00215C",
  lightBlue: "#3366CC",
  accentGreen: "#C5D92D",
  white: "#FFFFFF",
}

const CHART_COLORS = [
  SURA_COLORS.lightBlue,
  SURA_COLORS.accentGreen,
  SURA_COLORS.primaryBlue,
  SURA_COLORS.white,
  "#8884d8",
  "#ffc658",
]

const getChartColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length]

const CustomLabel = (props: any) => {
  const { x, y, width, value, fill } = props
  if (
    typeof x !== "number" ||
    isNaN(x) ||
    typeof y !== "number" ||
    isNaN(y) ||
    typeof width !== "number" ||
    isNaN(width)
  ) {
    return null // Don't render the label if we don't have valid positioning
  }
  return (
    <text x={x + width / 2} y={y} fill={fill || "#000"} textAnchor="middle" dy={-6}>
      {value}
    </text>
  )
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function Dashboard({ data }: { data: Policy[] }) {
  const [chartData] = useState(() => processData(data))
  const [revenueChartData] = useState(() => processRevenueData(data))

  const totalPolicies = data.length
  const annualPolicies = data.filter((policy) => policy.isAnualPlan).length
  const nonAnnualPolicies = totalPolicies - annualPolicies

  const annualPercentage = ((annualPolicies / totalPolicies) * 100).toFixed(1)
  const monthlyPercentage = ((nonAnnualPolicies / totalPolicies) * 100).toFixed(1)

  // Count policies by city
  const cityCounts = data.reduce(
    (acc, policy) => {
      const city = policy.ciudad || "Unknown"
      acc[city] = (acc[city] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const cityData = Object.entries(cityCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Top 10 cities

  // Count pets by species
  const speciesCounts = data.reduce(
    (acc, policy) => {
      const pets = Array.isArray(policy.lista_mascotas)
        ? policy.lista_mascotas
        : JSON.parse(policy.lista_mascotas as string)
      pets.forEach((pet: Pet) => {
        const species = pet.specie.toLowerCase()
        acc[species] = (acc[species] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const speciesData = Object.entries(speciesCounts).map(([name, value]) => ({ name, value }))

  // Add this after the speciesData calculation
  const totalPets = Object.values(speciesCounts).reduce((sum, count) => sum + count, 0)
  const petPolicyRatio = totalPets / totalPolicies

  // Process plan data
  const planData: PlanData[] = useMemo(() => {
    const planCounts: Record<string, number> = {}
    let totalPlans = 0

    data.forEach((policy) => {
      const pets = Array.isArray(policy.lista_mascotas)
        ? policy.lista_mascotas
        : JSON.parse(policy.lista_mascotas as string)

      pets.forEach((pet: Pet) => {
        planCounts[pet.plan] = (planCounts[pet.plan] || 0) + 1
        totalPlans++
      })
    })

    return Object.entries(planCounts)
      .map(([name, count]) => ({
        name,
        value: (count / totalPlans) * 100,
      }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  const totalRevenue = useMemo(() => calculateTotalRevenue(data), [data])

  return (
    <div className="p-8 bg-[#0033A0] text-white">
      <h1 className="text-3xl font-bold mb-6">Producción Bivett y Corresponsales</h1>
      <div className="grid gap-4 md:grid-cols-5 mb-8">
        <Card className="bg-[#00215C] border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Pólizas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalPolicies}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#00215C] border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Pago Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{annualPolicies}</div>
            <div className="text-sm text-[#C5D92D]">{annualPercentage}% del total</div>
          </CardContent>
        </Card>
        <Card className="bg-[#00215C] border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Pago Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{nonAnnualPolicies}</div>
            <div className="text-sm text-[#C5D92D]">{monthlyPercentage}% del total</div>
          </CardContent>
        </Card>
        <Card className="bg-[#00215C] border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Mascotas por Póliza</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{petPolicyRatio.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#00215C] border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Primas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              $
              {totalRevenue.toLocaleString("es-CO", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-[#00215C] border-none mb-8">
        <CardHeader>
          <CardTitle className="text-white">Distribución de Planes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart layout="vertical" data={planData} margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={SURA_COLORS.lightBlue} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                stroke={SURA_COLORS.white}
              />
              <YAxis dataKey="name" type="category" stroke={SURA_COLORS.white} tickLine={true} />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)}%`}
                contentStyle={{ backgroundColor: SURA_COLORS.lightBlue, color: SURA_COLORS.white, border: "none" }}
                itemStyle={{ color: SURA_COLORS.white }}
              />
              <Bar dataKey="value" fill={SURA_COLORS.accentGreen}>
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                  fill={SURA_COLORS.white}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-8 md:grid-cols-2 mb-8">
        <Card className="bg-[#00215C] border-none">
          <CardHeader>
            <CardTitle className="text-white">Pólizas Por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={SURA_COLORS.lightBlue} />
                <XAxis dataKey="month" stroke={SURA_COLORS.white} />
                <YAxis stroke={SURA_COLORS.white} />
                <Tooltip
                  contentStyle={{ backgroundColor: SURA_COLORS.lightBlue, color: SURA_COLORS.white, border: "none" }}
                  itemStyle={{ color: SURA_COLORS.white }}
                />
                <Legend wrapperStyle={{ color: SURA_COLORS.white }} />
                <Bar dataKey="annual" name="Anual" fill={SURA_COLORS.primaryBlue} stackId="a">
                  <LabelList dataKey="total" content={<CustomLabel fill={SURA_COLORS.white} />} />
                </Bar>
                <Bar dataKey="nonAnnual" name="Mensual" fill={SURA_COLORS.accentGreen} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-[#00215C] border-none">
          <CardHeader>
            <CardTitle className="text-white">Primas Por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={SURA_COLORS.lightBlue} />
                <XAxis dataKey="month" stroke={SURA_COLORS.white} />
                <YAxis stroke={SURA_COLORS.white} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: SURA_COLORS.lightBlue, color: SURA_COLORS.white, border: "none" }}
                  itemStyle={{ color: SURA_COLORS.white }}
                  formatter={(value) => [`$${Math.round(value).toLocaleString()}`, "Ingresos"]}
                />
                <Legend wrapperStyle={{ color: SURA_COLORS.white }} />
                <Bar dataKey="revenue" name="Ingresos" fill={SURA_COLORS.accentGreen}>
                  <LabelList
                    dataKey="revenue"
                    position="top"
                    content={<CustomLabel fill={SURA_COLORS.white} />}
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-8 md:grid-cols-2 mb-8">
        <Card className="bg-[#00215C] border-none">
          <CardHeader>
            <CardTitle className="text-white">Por Ciudad</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill={SURA_COLORS.lightBlue}
                  label={{ fill: SURA_COLORS.white }}
                >
                  {cityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: SURA_COLORS.lightBlue, color: SURA_COLORS.white, border: "none" }}
                  itemStyle={{ color: SURA_COLORS.white }}
                />
                <Legend wrapperStyle={{ color: SURA_COLORS.white }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-[#00215C] border-none">
          <CardHeader>
            <CardTitle className="text-white">Por Especie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={speciesData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill={SURA_COLORS.lightBlue}
                  label={{ fill: SURA_COLORS.white }}
                >
                  {speciesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: SURA_COLORS.lightBlue, color: SURA_COLORS.white, border: "none" }}
                  itemStyle={{ color: SURA_COLORS.white }}
                />
                <Legend wrapperStyle={{ color: SURA_COLORS.white }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

