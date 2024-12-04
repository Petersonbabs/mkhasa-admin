import React, { useState } from 'react';
import Link from 'next/link';

interface MobileSidebarProps {
  isOpen: boolean;
}



const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen }) => {
  

  return (
    <div className={`fixed top-0 left-0 h-full bg-gray-100 shadow-md transition-all duration-300 z-50 lg:hidden ${isOpen  ? 'w-64' : 'w-0'} `}>
      <ul className="space-y-1 pt-16 pl-5">
        <li className="p-3 font-bold text-lg"><Link href="/dashboard">Dashboard</Link></li>
        <li className="p-3"><Link href="/dashboard/order">Order</Link></li>
        <li>
          <Link href="/dashboard/bulk-update" className='cursor-pointer hover:bg-gray-200  p-3'>Bulk Update</Link>
        </li>
        <li className="p-3"><Link href="/dashboard/inventory">Inventory</Link></li>
        <li className="p-3"><Link href="/dashboard/category">Categories</Link></li>
        <li className="p-3"><Link href="/dashboard/slides">Slides</Link></li>
        <li className="p-3"><Link href="/dashboard/slides">Can Be Layered With</Link></li>
        <li>
          <Link href="/dashboard/similar-products">
            <span className="p-3 cursor-pointer hover:bg-gray-200 block">Similar Products</span>
          </Link>
        </li>
        <li className="p-3"><Link href="/dashboard/fbt">Frequently Bought Together</Link></li>
        
        <li className="p-3"><Link href="/dashboard/customers">Customers</Link></li>
        <li className="p-3"><Link href="/dashboard/vendors">Vendors</Link></li>
        <li className="p-3"><Link href="/dashboard/settings">Settings</Link></li>
      </ul>
    </div>
  );
};

export default MobileSidebar;