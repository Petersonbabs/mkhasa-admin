'use client'

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Trash2 } from 'lucide-react';

interface Product {
    _id: string;
    name: string;
    category?: string;
    price?: number;
    checked: boolean;
}

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div>
    </div>
);

const LayerWithPage = () => {
    const { id } = useParams()
    const { data: session } = useSession()
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchAllProducts = async () => {

        try {
            const response = await fetch("https://mkhasa-bfdb6fabd978.herokuapp.com/api/v1/all/products", {
                method: "GET",
            });

            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error('Failed to fetch products', { position: 'top-right' });
            return [];
        }
    };

    const fetchIndividualProduct = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`https://mkhasa-bfdb6fabd978.herokuapp.com/api/v1/product/${id}`, {
                method: "GET",
            });
            console.log(response)
            if (!response.ok) throw new Error('Failed to fetch layer with');
            const data = await response.json();
            console.log({data})
            return data.layerWith.map((item: any) => item._id);

        } catch (error) {
            console.error("Error fetching layer with:", error);
            toast.error('Failed to fetch layer with', { position: 'top-right' });
            return [];
        }
    };

    const processProduct = async (productLayerIds: string[], allProducts: Product[]) => {
        const productLayerIdSet = new Set(productLayerIds);
        return allProducts.map(product => ({
            ...product,
            checked: productLayerIdSet.has(product._id)
        }));
    };

    const fetchData = async () => {
        setLoadingProducts(true);
        try {
            const allProducts = await fetchAllProducts();
            const layerWithIds = await fetchIndividualProduct();
            console.log(layerWithIds);

            const processedProducts = await processProduct(layerWithIds, allProducts);
            console.log(processedProducts)
            setProducts(processedProducts);
        } catch (error) {
            console.error("Error fetching and processing data:", error);
            toast.error('Failed to fetch and process data', { position: 'top-right' });
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleSaveAndContinue = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log(token);
        console.log(session?.user._id);


        const layerWithIds = products.filter(product => product.checked).map(product => product._id);
        console.log(layerWithIds)

        try {
            const response = await fetch(`https://mkhasa-bfdb6fabd978.herokuapp.com/api/v1/new/66542da6f1f73b11f47b728a/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ layerWith: layerWithIds })
            });

            if (!response.ok) throw new Error('Failed to update layer with');

            toast.success('layer with updated successfully');
        } catch (error) {
            console.error('Error updating layer with:', error);
            toast.error('An error occurred while updating layer with', { position: 'top-right' });
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddProduct = (productId: string) => {
        setProducts(prevProducts =>
            prevProducts.map(product =>
                product._id === productId
                    ? { ...product, checked: true }
                    : product
            )
        );
    };

    const handleRemoveProduct = (productId: string) => {
        setProducts(prevProducts =>
            prevProducts.map(product =>
                product._id === productId
                    ? { ...product, checked: false }
                    : product
            )
        );
    };



    return (
        <>
            <div className="mb-6">
                {loadingProducts ? (
                    <LoadingSpinner />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Remove</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.filter(product => product.checked).map((product) => (
                                <TableRow key={product._id}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.category || 'N/A'}</TableCell>
                                    <TableCell>
                                        <span className={product.price && product.price > 0 ? 'text-green-500' : 'text-red-500'}>
                                            {product.price && product.price > 0 ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{product.price ? `₦${product.price.toFixed(2)}` : 'N/A'}</TableCell>
                                    <TableCell>
                                    <Trash2 className='cursor-pointer size-5 stroke-red-500 hover:scale-125' onClick={()=>{handleRemoveProduct(product._id)}}/>
                                </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

            </div>

            <Button
                className="w-full mb-6 rounded-none bg-black"
                onClick={handleSaveAndContinue}
                disabled={loading}
            >
                {loading ? <LoadingSpinner /> : 'Save & Continue'}
            </Button>

            <div>
                <h2 className="text-base font-semibold text-center md:text-left bg-gray-50 py-1 pl-2 mb-6">Add Layer With</h2>
                <form className="w-full md:flex-grow lg:max-w-[50%] relative mb-4 lg:mt-0" onSubmit={(e) => e.preventDefault()}>
                    <Input
                        id="search"
                        name="search"
                        type="text"
                        placeholder="Search By Name"
                        className="w-full px-6 py-2 rounded-full outline-none border-none bg-gray-50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        aria-label="search for product"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        type="submit"
                    >
                        <Icon icon="mynaui:search" style={{ fontSize: 20 }} />
                    </button>
                </form>
                {loadingProducts ? (
                    <LoadingSpinner />
                ) : (
                    <ul className="space-y-2 w-full lg:w-[60%]">
                        {filteredProducts.map((product) => (
                            <li key={product._id} className="flex justify-between w-full items-center">
                                <span className='line-clamp-1'>{product.name}</span>
                                <div className='flex gap-3'>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className='hover:bg-black hover:text-white rounded-none'
                                        onClick={() => handleAddProduct(product._id)}
                                        disabled={product.checked}
                                    >
                                        {product.checked ? 'Added' : '+'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className='hover:bg-black hover:text-white rounded-none'
                                        onClick={() => handleRemoveProduct(product._id)}
                                        disabled={!product.checked}
                                    >
                                        -
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
};

export default LayerWithPage;