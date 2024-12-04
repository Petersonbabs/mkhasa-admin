import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const OrderStatistics = () => {
  const [totalOrder, setTotalOrder] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
  const [deliveredOrdersCount, setDeliveredOrdersCount] = useState(0)
  const [dispatchedOrdersCount, setDispatchedOrdersCount] = useState(0)
  const router = useRouter();


  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session?.user?._id) {
        fetchDailyCount(session.user._id);
        fetchDatas()
      } else {
        console.error("Session user ID is undefined");
        setLoading(false);
      }
    }
  }, [status, router]);

  const fetchDatas = async ()=>{
    const [pendingOrders, deliveredOrders, dispatchedOrders, totalOrder ] = await Promise.all([
      axios.get(`/api/proxy?path=count/pending/order&adminId=${session?.user._id}`),
      axios.get(`/api/proxy?path=count/delivered/order&adminId=${session?.user._id}`),
      axios.get(`/api/proxy?path=count/dispatched/order&adminId=${session?.user._id}`),
      axios.get(`/api/proxy?path=count/all/order/${session?.user._id}`),
    ])
    setPendingOrdersCount(pendingOrders.data) 
    setDeliveredOrdersCount(deliveredOrders.data)
    setDispatchedOrdersCount(dispatchedOrders.data)
    setTotalOrder(totalOrder.data)
  }

  const fetchDailyCount = async (adminId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`https://mkhasa-bfdb6fabd978.herokuapp.com/api/v1/all/order/system/${adminId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch total order');
      }
      const data = await response.json();
      setDailyCount(data?.length); // Assuming the API returns an object with a 'count' property
    } catch (error) {
      console.error('Error fetching daily count:', error);
    } finally {
      setLoading(false);
    }
  };



  if (status === "loading" || loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col lg:flex-row justify-between items-center my-4 p-2 bg-gray-100 rounded">
        <h2 className="text-3xl pb-3 lg:pb-0">Today</h2>
      <div className='grid justify-around grid-cols-2 lg:grid-cols-5 items-center gap-8'>
      <div className="text-center">    
        <p className='text-xs lg:text-base'>Total Order</p>
        <h2 className="text-3xl font-bold">{totalOrder}</h2>
      </div>
      <div className="text-center">        
        <p className='text-xs lg:text-base'>Ordered Items Over Time</p>
        <h2 className="text-3xl font-bold">{dailyCount}</h2>
      </div>
      <div className="text-center">        
        <p className='text-xs lg:text-base'>Pending Orders</p>
        <h2 className="text-3xl font-bold">{pendingOrdersCount}</h2>
      </div>
      <div className="text-center">        
        <p className='text-xs lg:text-base'>Delivered Orders</p>
        <h2 className="text-3xl font-bold">{deliveredOrdersCount}</h2>
      </div>
      <div className="text-center">        
        <p className='text-xs lg:text-base'>Dispatched Orders</p>
        <h2 className="text-3xl font-bold">{dispatchedOrdersCount}</h2>
      </div>
      </div>
    </div>
  );
};

export default OrderStatistics;
