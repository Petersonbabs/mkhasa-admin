import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <div className="hidden lg:block w-64 bg-gray-100 shadow-md h-full overflow-y-auto">
      <ul className="space-y-1">
        <li>
          <Link href="/dashboard">
            <span className="p-3 font-bold text-lg block">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/order">
            <span className="p-3 cursor-pointer hover:bg-gray-200 block">Order</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/bulk-update" className='cursor-pointer hover:bg-gray-200 relative block border p-3'>
            <span className='p-3 cursor-pointer hover:bg-gray-200 block'>Bulk Update</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/inventory">
            <span className="p-3 cursor-pointer hover:bg-gray-200 block">Inventory</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/category">
            <span className="p-3 cursor-pointer hover:bg-gray-200 block">Categories</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/slides">
            <span className="p-3 cursor-pointer hover:bg-gray-200 block">Slides</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/slides">
            <span className="p-3 cursor-pointer hover:bg-gray-200 block">Can Be Layered With</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/fbt">
            <span className="p-3 cursor-pointer hover:bg-gray-200 block">Frequently Bought Together</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/similar-products">
            <span className="p-3 cursor-pointer hover:bg-gray-200 block">Similar Products</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/customers">
            <span className="p-3 cursor-pointer hover:bg-gray-200 block">Customers</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/vendors">
            <span className="p-3 cursor-pointer hover:bg-gray-200 block">Vendors</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/settings">
            <span className="p-3 cursor-pointer hover:bg-gray-200 block">Settings</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
