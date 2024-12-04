'use client'

import { Heading } from '@/components/heading';
import { Mail, MapPinCheckInsideIcon, Phone } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import UserImage from '@/public/images/user.png';
import Image from 'next/image';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Product {
    name: string;
    price: number;
    quantity: number;
    _id: string;
}

interface OrderProps {
    Date: Date;
    status: string;
    address: string;
    code: string;
    payment: boolean;
    name: string;
    phone: string;
    orderedBy: string;
    total: string;
    items: Product[]
}

const Page = () => {
    const { id } = useParams();
    const [loadOrder, setLoadOrder] = useState(false);
    const { data: session } = useSession();
    const [order, setOrder] = useState<OrderProps>();

    const fetchOrder = useCallback(async () => {
        setLoadOrder(true);
        try {
            const response = await fetch(`https://mkhasa-bfdb6fabd978.herokuapp.com/api/v1/single/order/${session?.user._id}/${id}`);
            if (!response.ok) {
                throw new Error('Unable to fetch single product!');
            }
            const data = await response.json();
            setOrder(data.order);
            console.log(data.order)
        } catch (error) {
            console.error(error);
            toast.error('Unable to fetch product!');
        } finally {
            setLoadOrder(false);
        }
    }, [session, id]);

    useEffect(() => {
        if (session) {
            fetchOrder();
        }
    }, [session, fetchOrder]);

    const formatDate = (date: Date) => {
        const dateObject = new Date(date);
        return dateObject.toISOString().split('T')[0];
    };

    return (
        <div>
            {order ? (
                <>
                    <Heading className="capitalize mb-4">{order.status} Order</Heading>
                    <div className="flex flex-col sm:flex-row items-center p-6 bg-gray-100 justify-between gap-4 font-semibold">
                        <div>Order: {order.code}</div>
                        <div>
                            Status: <span className={`${order.status === 'Pending' ? 'text-yellow-300' : order.status === 'dispatched' ? 'text-blue-500' : 'text-green-400'}`}>{order.status}</span>
                        </div>
                        <div>Date: {formatDate(order.Date)}</div>
                        <div>
                            Payment: <span className={`${order.payment ? 'text-green-400' : 'text-yellow-300'}`}>{order.payment ? 'Paid' : 'Unpaid'}</span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <section className="border p-6 rounded max-w-[1140px] mx-auto my-8">
                        <Heading className="mb-4">Customer Information</Heading>
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between flex-wrap">
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center text-center">
                                <div className="rounded-full w-[20%] max-w-[100px]">
                                    <Image src={UserImage} alt={order.name} className="rounded-full w-full" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{order.name}</h2>
                                    <p className="flex gap-2 items-center text-gray-700 text-sm">
                                        <Mail fill="50" stroke="white" className="color-white size-4" />
                                        <span>{order.orderedBy}</span>
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="flex gap-2 items-center text-gray-700 text-sm">
                                    <Phone fill="50" stroke="white" className="color-white size-4" />
                                    <span>{order.phone}</span>
                                </p>
                            </div>
                            <div>
                                <p className="flex gap-2 items-center text-gray-700 text-sm">
                                    <MapPinCheckInsideIcon fill="50" stroke="white" className="color-white size-4" />
                                    <span>{order.address}</span>
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Product Info */}
                    <section className="max-w-[1140px] mx-auto border p-6 rounded mb-8  ">
                        <Heading className="mb-4">Ordered Products</Heading>

                        {
                            order.items.map((product) => {
                                return (
                                    <>
                                        <div className='border p-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 mb-4 shadow flex-wrap'>
                                            <p className='flex flex-col sm:flex-row items-center justify-center gap-3'>
                                                <span className='font-bold'>Product Name:</span> <span className='text-sm'>{product.name}</span>
                                            </p>
                                            <p className='flex flex-col sm:flex-row items-center justify-center gap-3'>
                                                <span className='font-bold'>Quantity: </span>
                                                <span className='text-sm'>{product.quantity}</span>
                                            </p>

                                            <p className='flex flex-col sm:flex-row items-center justify-center gap-3'>
                                                <span className='font-bold'>Price: </span>
                                                <span className='text-sm'>₦{product.price.toLocaleString()}</span></p>

                                              
                                        </div >
                                    </>
                                )
                            })
                        }
                    </section>

                    {/* Delivery Info */}
                    <section className="max-w-[1140px] mx-auto border p-6 rounded mb-8 space-y-4">
                        <Heading className="mb-4">Delivery Information</Heading>
                        <div>
                            <p>
                                <span className="font-bold">Delivery Method</span>: Dispatch
                            </p>
                            <p className="hidden">Delivery confirmation: </p>
                        </div>
                        <div>
                            <p className="flex gap-4 items-center">
                                <Phone className="size-3" />
                                <span>{order.phone}</span>
                            </p>
                        </div>
                        <div>
                            <p className="flex gap-4 items-center">
                                <Mail className="size-3" />
                                <span>{order.orderedBy}</span>
                            </p>
                        </div>
                    </section>

                    {/* Total */}
                    <section>
                        <div className="flex items-center h-8 justify-center sm:justify-end max-w-[1140px] m-auto">
                            <span className="px-2 bg-black text-white">Total: </span>
                            <span className="px-2 font-bold">₦ {order.total.toLocaleString()}</span>
                        </div>
                    </section>
                </>
            ) : (
                <h1 className="text-center p-10">Loading...</h1>
            )
            }
        </div >
    );
};

export default Page;
