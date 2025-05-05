import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const ChartVentas = ({ data }) => (
  <div className="bg-white p-4 rounded-2xl shadow-md">
    <h3 className="text-lg font-semibold mb-2">Ventas últimos 7 días</h3>
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="fecha" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="total_dia" stroke="#4f46e5" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default ChartVentas;
