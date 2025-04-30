import React from 'react';

const PendingOffers = () => {
  const orders = [
    {
      title: 'Vintage Watch',
      buyer: 'User123',
      email: 'user123@example.com',
      address: '123 Main St, Anytown, AN 12345',
      country: 'United States',
      quantity: 1,
      status: 'Pending',
    },
    {
      title: 'Leather Jacket',
      buyer: 'User456',
      email: 'user456@example.com',
      address: '456 Oak Ave, Othertown, OT 67890',
      country: 'Canada',
      quantity: 2,
      status: 'Processing',
      cancelTimer: '00:33:14',
    },
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Pending Orders</h1>
      <div className="space-y-6">
        {orders.map((order, index) => (
          <div
            key={index}
            className="bg-gray-800 p-6 rounded-lg shadow-md space-y-4"
          >
            <h2 className="text-xl font-semibold">{order.title}</h2>
            <p>
              <span className="font-bold">Buyer:</span> {order.buyer}
            </p>
            <p>
              <span className="font-bold">Email:</span> {order.email}
            </p>
            <p>
              <span className="font-bold">Address:</span> {order.address}
            </p>
            <p>
              <span className="font-bold">Country:</span> {order.country}
            </p>
            <p>
              <span className="font-bold">Quantity:</span> {order.quantity}
            </p>
            <div
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                order.status === 'Pending'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {order.status}
            </div>
            {order.cancelTimer && (
              <p className="text-sm text-gray-400">
                Buyer can't cancel the order for{' '}
                <span className="font-bold">{order.cancelTimer}</span>
              </p>
            )}
            <p>Order isn&apos;t completed yet.</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
              Update Status
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingOffers;