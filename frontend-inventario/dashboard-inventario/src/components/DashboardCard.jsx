const DashboardCard = ({ title, value, color }) => {
    return (
      <div className={`bg-${color}-100 p-4 rounded-2xl shadow-md`}>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
    );
  };
  
  export default DashboardCard;
  