import { Zap, Leaf, BarChart3, Recycle } from 'lucide-react';

export default function RECDashboard({ 
  tokenBalance, 
  retiredBalance, 
  totalSupply, 
  totalRetired,
  isLoading 
}) {
  const stats = [
    {
      title: 'Your VREC Balance',
      value: isLoading ? 'Loading...' : `${tokenBalance} VREC`,
      icon: Zap,
      description: 'Renewable Energy Certificates you own',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Your Retired RECs',
      value: isLoading ? 'Loading...' : `${retiredBalance} VREC`,
      icon: Recycle,
      description: 'RECs you have retired for environmental impact',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Supply',
      value: isLoading ? 'Loading...' : `${totalSupply} VREC`,
      icon: BarChart3,
      description: 'Total RECs minted on the platform',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Retired',
      value: isLoading ? 'Loading...' : `${totalRetired} VREC`,
      icon: Leaf,
      description: 'Total RECs retired across all users',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="bg-white rounded-lg card-shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">REC Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bgColor} rounded-lg p-4 border border-gray-200`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {stat.title}
                </p>
                <p className="text-xs text-gray-500">
                  {stat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {!isLoading && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            What are Renewable Energy Certificates (RECs)?
          </h3>
          <p className="text-sm text-gray-600">
            RECs represent the environmental benefits of renewable energy generation. 
            Each VREC token represents 1 MWh of renewable energy. You can trade RECs 
            or retire them to claim their environmental benefits for carbon offsetting.
          </p>
        </div>
      )}
    </div>
  );
}
