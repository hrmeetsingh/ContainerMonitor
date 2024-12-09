import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { Badge } from '@/components/ui/badge';
import { AlertCircle, Cpu, MemoryStick, HardDrive } from 'lucide-react';
import './App.css';

// Mock Prometheus data fetching (replace with actual Prometheus API call)
const fetchPrometheusData = async (query: string) => {
  try {
    // In a real implementation, this would be an actual Prometheus API call
    const response = await fetch(`/api/prometheus?query=${encodeURIComponent(query)}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Prometheus data:', error);
    return null;
  }
};

// Type definitions for Prometheus metrics
type MetricData = {
  metric: { [key: string]: string };
  values: [number, string][];
};

type SystemMetrics = {
  cpu: number;
  memory: number;
  diskUsage: number;
  alerts: string[];
};

const PrometheusDashboard: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    diskUsage: 0,
    alerts: []
  });

  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      // Simulated metrics fetching - replace with actual Prometheus queries
      const cpuData = await fetchPrometheusData('sum(rate(node_cpu_seconds_total{mode!="idle"}[5m])) by (instance) * 100');
      const memoryData = await fetchPrometheusData('node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100');
      const diskData = await fetchPrometheusData('node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100');
      
      // Process historical data for charts
      const processHistoricalData = (metricData: MetricData[]) => {
        if (!metricData || !metricData.length) return [];
        
        return metricData[0].values.map(([timestamp, value]) => ({
          time: new Date(timestamp * 1000).toLocaleTimeString(),
          value: parseFloat(value)
        }));
      };

      setSystemMetrics({
        cpu: cpuData ? parseFloat(cpuData.data.result[0].value[1]) : 0,
        memory: memoryData ? parseFloat(memoryData.data.result[0].value[1]) : 0,
        diskUsage: diskData ? parseFloat(diskData.data.result[0].value[1]) : 0,
        alerts: [] // In real implementation, fetch active alerts
      });

      // Simulated historical data processing
      setHistoricalData(processHistoricalData(cpuData?.data?.result));
    };

    fetchMetrics();
    const intervalId = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Prometheus System Dashboard</h1>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="historical">Historical</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.cpu.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">Current CPU Utilization</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Available</CardTitle>
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.memory.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">Memory Usage</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disk Space</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.diskUsage.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">Disk Usage</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="historical">
          <Card>
            <CardHeader>
              <CardTitle>CPU Usage Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {systemMetrics.alerts.length > 0 ? (
                systemMetrics.alerts.map((alert, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Alert Detected</AlertTitle>
                    <AlertDescription>{alert}</AlertDescription>
                  </Alert>
                ))
              ) : (
                <div className="text-center text-muted-foreground">
                  No active alerts
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrometheusDashboard;