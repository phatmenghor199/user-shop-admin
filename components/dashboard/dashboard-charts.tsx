"use client"

import { useTheme } from "next-themes"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const data = [
  {
    name: "Jan",
    total: 1800,
    sales: 900,
  },
  {
    name: "Feb",
    total: 2200,
    sales: 1100,
  },
  {
    name: "Mar",
    total: 2800,
    sales: 1400,
  },
  {
    name: "Apr",
    total: 2400,
    sales: 1200,
  },
  {
    name: "May",
    total: 2900,
    sales: 1450,
  },
  {
    name: "Jun",
    total: 3200,
    sales: 1600,
  },
  {
    name: "Jul",
    total: 3800,
    sales: 1900,
  },
  {
    name: "Aug",
    total: 4000,
    sales: 2000,
  },
  {
    name: "Sep",
    total: 4200,
    sales: 2100,
  },
  {
    name: "Oct",
    total: 4500,
    sales: 2250,
  },
  {
    name: "Nov",
    total: 4800,
    sales: 2400,
  },
  {
    name: "Dec",
    total: 5200,
    sales: 2600,
  },
]

export function DashboardCharts() {
  const { theme } = useTheme()

  // Determine colors based on theme
  const textColor = theme === "dark" ? "#f8fafc" : "#0f172a"
  const gridColor = theme === "dark" ? "#334155" : "#e2e8f0"

  return (
    <Tabs defaultValue="line">
      <div className="flex items-center justify-between">
        <TabsList className="grid w-[200px] grid-cols-2">
          <TabsTrigger value="line">Line</TabsTrigger>
          <TabsTrigger value="bar">Bar</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="line" className="mt-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke={textColor}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="bar" className="mt-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke={textColor}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip />
            <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sales" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  )
}

