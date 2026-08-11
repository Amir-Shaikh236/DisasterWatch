import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, CartesianGrid, XAxis, YAxis, BarChart } from "recharts"

export default function DisasterType() {

    const disasterData = [
        {
            disaster: "Earthquake",
            alerts: 24,
        },
        {
            disaster: "Flood",
            alerts: 36,
        },
        {
            disaster: "Wildfire",
            alerts: 17,
        },
        {
            disaster: "Landslide",
            alerts: 11,
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
                <CardTitle className="text-foreground -mb-2"> Alerts by Disaster Type </CardTitle>
                <CardDescription className="tracking-wider">Review All Verified Alerts by Disaster Type</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-62.5">
                    <BarChart accessibilityLayer data={disasterData} layout="vertical" margin={{
                        left: 10,
                    }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="disaster"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            width={80}
                        />
                        <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="alerts" fill="var(--color-alerts)" radius={6} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
};