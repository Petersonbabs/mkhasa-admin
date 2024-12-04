'use client'

import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

export interface Product {
    _id: string;
    name: string;
    price: number;
    similar: string[];
    category: string;
    description: string;
    mainImage: File | string | null;
    firstImage: File | string | null;
    secondImage: File | string | null;
    thirdImage: File | string | null;
    additionalImages: string[];
    FBT: Product[];
    brand: string;
    sku: string;
    weight: number;
    dimensions: {
        length: number;
        width: number;
        height: number;
    };
    quantity: string;
    discountPercentage: string;
    appeal: string;
    manufacturer: string;
    serialName: string;
    serialBarcode: string;
    barcode: string;
    topNotes: string;
    volume: string;
    type: string;
    middleNotes: string;
    baseNotes: string;
    isAvailable: string;
    isFeatured: string;
    quantityInStock: number;
    // layerWith?: string;
}

interface ProductContextType {
    products: Product[];
    fetchProducts: () => void;
    fetchProductById: (id: string) => Promise<Product | undefined>;
    loadingProducts: boolean;
    loadingAllProducts: boolean;
    loadingProductUpdate: boolean;
    updatePriceInBulk: (productIds: string[], price: number) => Promise<void>;
    loadingFbt: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProductContext = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error("useProductContext must be used within a ProductProvider");
    }
    return context;
};


const ProductProvider = ({ children }: { children: ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState<boolean>(false)
    const [loadingAllProducts, setLoadingAllProducts] = useState<boolean>(true)
    const [loadingProductUpdate, setLoadingProductUpdate] = useState<boolean>(false)
    const {data: session} = useSession()
    const [loadingFbt, setLoadingFbt] = useState<boolean>(false)

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    

    // GET ALL PRODUCTS
    const fetchProducts = async () => {
        setLoadingProducts(true);
        setLoadingAllProducts(true);
        console.log('PRODUCT CONTEXT: fetching all product...');

        try {
            const response = await fetch(`https://mkhasa-bfdb6fabd978.herokuapp.com/api/v1/all/products`);
            const data = await response.json();
            setProducts(data);
            toast.success('Products fetched!')
            
            if (!response.ok) {
                toast.error('Failed to fetch products!')
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoadingProducts(false);
            setLoadingAllProducts(false);
        }
    };
    

    //   UPDATE PRICE IN BULK
    const updatePriceInBulk = async (productIds: string[], price: number) => {
        setLoadingProductUpdate(true)
        console.log('updatinggg');
        
        try {
            const response = await axios.post(`${baseUrl}/edit/bulk/price/66542da6f1f73b11f47b728a`,{productIds, price})
            console.log(response);
            const data = response.data
            console.log(data);
            if(response.status == 200){
                toast.success('Products price updated!')
                fetchProducts()
            }
            
            
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoadingProductUpdate(false)
            console.log('done updating!');
        }
    }

    const fetchProductById = async (id: string): Promise<Product | undefined> =>  {
        setLoadingFbt(true)
        console.log('PRODUCT CONTEXT: Fetching single product');
        
        try {
            const response = await fetch(`https://mkhasa-bfdb6fabd978.herokuapp.com/api/v1/product/${id}`);
            const data = await response.json();
            console.log(data);
            
            return data
        } catch (error) {
            console.error("Error at fetch single product:", error);
            toast.error('Failed to fetch single product')
        } finally {
            setLoadingFbt(false)
        }
    };

    
    

    const value: ProductContextType  = {
        products,
        fetchProducts,
        loadingProducts,
        fetchProductById, 
        loadingAllProducts,
        loadingProductUpdate,
        updatePriceInBulk,
        loadingFbt
    }

    return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>

}

export default ProductProvider