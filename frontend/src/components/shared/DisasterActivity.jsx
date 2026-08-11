import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CartesianGrid, XAxis, YAxis, AreaChart, Area } from "recharts"

export default function DisasterActivity() {

    const disasterActivity = [
        {
            day: "Mon",
            alerts: 12,
        },
        {
            day: "Tue",
            alerts: 18,
        },
        {
            day: "Wed",
            alerts: 9,
        },
        {
            day: "Thu",
            alerts: 24,
        },
        {
            day: "Fri",
            alerts: 31,
        },
        {
            day: "Sat",
            alerts: 27,
        },
        {
            day: "Sun",
            alerts: 36,
        },
    ];

    const chartConfig = {
        alerts: {
            label: "Alerts",
            color: "var(--chart-1)",
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg tracking-tight -mb-2"> Alerts Activity </CardTitle>
                <CardDescription className="text-sm tracking-wider text-muted-foreground"> Alerts Submitted over the last 7 days </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-62.5">
                    <AreaChart accessibilityLayer data={disasterActivity} margin={{
                        left: 10,
                    }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis tickLine={false} axisLine={false} allowDecimals={false} tickMargin={8} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Area dataKey="alerts" fill="var(--color-alerts)" type="monotone" fillOpacity={0.2} stroke="var(--color-alerts)" strokeWidth={2} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}