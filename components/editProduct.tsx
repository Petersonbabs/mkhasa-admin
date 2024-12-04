"use client"

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Heading } from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Product {
    _id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    mainImage: File | string | null;
    firstImage: File | string | null;
    secondImage: File | string | null;
    thirdImage: File | string | null;
    additionalImages: string[];
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
    layerWith: string[];
    similar: string[],
     recommend: string[],
     reviews: string[],
     FBT: string[]

}

interface EditProductProps {
    productId: string;
}

type Category = {
    _id: string;
    name: string;
};

const EditProduct: React.FC<EditProductProps> = ({ productId }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [errors, setErrors] = useState<Partial<Product>>({});
    const [categories, setCategories] = useState<Category[]>([]);
    const formRef = useRef<HTMLFormElement>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [loadingUpdate, setLoadingUpdate] = useState(false)
    const { data: session } = useSession();
    // const [formData, setFormData] = useState<FormData>({})

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId, session]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`https://mkhasa-bfdb6fabd978.herokuapp.com/api/v1/product/${productId}`);
            if (response.ok) {
                const data = await response.json();

                setProduct(data);
            } else {
                toast.error('Failed to fetch product');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Error fetching product');
        } finally {
            setLoading(false);
        }
    };

    const handleDiscardChanges = () => {
        setErrors({});
    };

    // fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/proxy?path=all/category');
                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // hadle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

        const { name, value } = e.target;
        setProduct(prev => prev ? { ...prev, [name]: value } : null);


    };

    // handle select change
    const handleSelectChange = (name: string, value: string | boolean) => {
        setProduct(prev => prev ? { ...prev, [name]: value } : null);

    };

    // handle image dimension change
    const handleDimensionChange = (dimension: 'length' | 'width' | 'height', value: string) => {

        setProduct(prev => prev ? {
            ...prev,
            dimensions: {
                ...prev.dimensions,
                [dimension]: parseFloat(value)
            }
        } : null);
    };

    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>, fieldName: keyof Product) => {
        const file = event.target.files?.[0];
        if (file) {
            setProduct(prev => {
                if (!prev) return null;
                return { ...prev, [fieldName]: file }
            });
            console.log(product)
        }

    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Updating product...');
        setLoadingUpdate(true);
    
        try {
            if (!product) {
                throw new Error("Product is null or undefined.");
            }
        
            // Exclude the `layerWith` field
            const { layerWith, similar, recommend, reviews, FBT, ...restProduct } = product;
    
            const formData = new FormData();
            Object.entries(restProduct).forEach(([key, value]) => {
                if (key.includes('Image') && value instanceof File) {
                    formData.append(key, value); // Append image files
                } else if (value !== undefined && value !== null) {
                    formData.append(key, String(value)); // Append other fields as strings
                }
            });
    
           
    
            const response = await axios.put(
                `https://mkhasa-bfdb6fabd978.herokuapp.com/api/v1/product/66542da6f1f73b11f47b728a/${product?._id}`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
    
            if (response.status === 200) {
                toast.success('Product updated!');
                router.push('/dashboard/inventory');
            } else {
                console.error('Response Error:', response.data);
                toast.error(response.data?.message || 'Error updating product');
            }
        } catch (error) {
            console.error('Error updating product:', error);
    
            if (axios.isAxiosError(error)) {
                console.error('Axios error response:', error.response?.data);
                toast.error(error.response?.data?.message || 'Failed to update product');
            } else {
                toast.error('Unexpected error occurred');
            }
        } finally {
            console.log('Done!');
            setLoadingUpdate(false);
        }
    };
    
    


    const triggerSubmit = () => {

        formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    // if (!product) {
    //     return <div>Product not found</div>;
    // }

    return (

        <>

            {/* HEADING */}
            <div className="flex flex-col md:flex-row gap-5 md:gap-0 justify-between items-center mb-4">
                <Heading>Edit Product</Heading>

            </div>
            {/* END OF HEADING */}

            {/* THE FORM */}
            <div className="py-4 md:py-8 grid gap-10 lg:grid-cols-12">
                {/* LEFT SECTION */}
                <div className="lg:col-span-7">
                    <Card className="mb-8 border-none bg-gray-50">
                        <CardContent className='py-5'>
                            <h2 className="text-xl font-semibold mb-4">General Information</h2>
                            <form ref={formRef} onSubmit={handleSubmit} className='flex flex-col gap-5'>
                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">Product Name</Label>
                                    <Input
                                        name="name"
                                        value={product?.name}
                                        onChange={handleInputChange}
                                        type="text"
                                        className='bg-white border-gray-200'
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">Description</Label>
                                    <Textarea
                                        name="description"
                                        value={product?.description}
                                        onChange={handleInputChange}
                                        className='h-32'
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">Serial Name</Label>
                                    <Input
                                        type="text"
                                        name="serialName"
                                        value={product?.serialName}
                                        onChange={handleInputChange}
                                        className='bg-white border-gray-200'
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.serialName}</p>}
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">Serial bar code</Label>
                                    <Input
                                        type="text"
                                        name="serialBarcode"
                                        value={product?.serialBarcode}
                                        onChange={handleInputChange}
                                        className='bg-white border-gray-200'
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.serialBarcode}</p>}
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">Brand</Label>
                                    <Input
                                        type="text"
                                        name="brand"
                                        value={product?.brand}
                                        onChange={handleInputChange}
                                        className='bg-white border-gray-200'
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">Manufacturer</Label>
                                    <Input
                                        type="text"
                                        name="manufacturer"
                                        value={product?.manufacturer}
                                        onChange={handleInputChange}
                                        className='bg-white border-gray-200'
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.manufacturer}</p>}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* LEFT SECTION: PRICING SECTION */}
                    <Card className="mb-8 border-none bg-gray-50">
                        <CardContent className='py-5'>
                            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
                            <form className="grid gap-5" ref={formRef} onSubmit={handleSubmit}>
                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">Base Price</Label>
                                    <Input
                                        type="text"
                                        name="price"
                                        value={product?.price}
                                        onChange={handleInputChange}
                                        className='bg-white border-gray-200'
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">Discount Percentage (%)</Label>
                                    <Input
                                        type="text"
                                        name="discountPercentage"
                                        value={product?.discountPercentage}
                                        onChange={handleInputChange}
                                        className='bg-white border-gray-200 w-1/2'
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.discountPercentage}</p>}

                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/*  INVENTORY */}
                    <Card className="mb-8 border-none bg-gray-50">
                        <CardContent className='py-5'>
                            <h2 className="text-xl font-semibold mb-4">Inventory</h2>
                            <form className="grid grid-cols-3 gap-5" ref={formRef} onSubmit={handleSubmit}>
                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">SKU</Label>
                                    <Input
                                        type="text"
                                        name="sku"
                                        value={product?.sku}
                                        onChange={handleInputChange}
                                        className='bg-white border-gray-200'
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">Barcode</Label>
                                    <Input
                                        type="text"
                                        name="barcode"
                                        value={product?.barcode}
                                        onChange={handleInputChange}
                                        className='bg-white border-gray-200'
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.barcode}</p>}
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">Quantity</Label>
                                    <Input
                                        type="text"
                                        name="quantity"
                                        value={product?.quantity}
                                        onChange={handleInputChange}
                                        className='bg-white border-gray-200'
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* NOTES */}
                    <Card className="mb-8 border-none bg-gray-50">
                        <CardContent className='py-5'>
                            <h2 className="text-xl font-semibold mb-4">Notes</h2>
                            <form className="grid gap-5" ref={formRef} onSubmit={handleSubmit}>
                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">Top Notes</Label>
                                    <Input
                                        type="text"
                                        name="topNotes"
                                        value={product?.topNotes}
                                        onChange={handleInputChange}
                                        className='bg-white border-gray-200'
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.topNotes}</p>}
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">Middle Notes</Label>
                                    <Input
                                        type="text"
                                        name="middleNotes"
                                        value={product?.middleNotes}
                                        onChange={handleInputChange}
                                        className='bg-white border-gray-200'
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.middleNotes}</p>}
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">Base Notes</Label>
                                    <Input
                                        type="text"
                                        name="baseNotes"
                                        value={product?.baseNotes}
                                        onChange={handleInputChange}
                                        className='bg-white border-gray-200'
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.baseNotes}</p>}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* OTHER */}
                    <Card className="mb-8 border-none bg-gray-50">
                        <CardContent className='py-5'>
                            <h2 className="text-xl font-semibold mb-4">Other</h2>
                            <form className="grid gap-5" ref={formRef} onSubmit={handleSubmit}>
                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">Appeal</Label>
                                    <Select
                                        value={product?.appeal}
                                        onValueChange={(value) => handleInputChange({ target: { name: 'appeal', value } } as any)}
                                    >
                                        <SelectTrigger className="bg-transparent rounded-sm">
                                            <SelectValue placeholder="Select Appeal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="men">Men</SelectItem>
                                            <SelectItem value="women">Women</SelectItem>
                                            <SelectItem value="unisex">Unisex</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">Type</Label>
                                    <Select
                                        value={product?.type}
                                        onValueChange={(value) => handleInputChange({ target: { name: 'type', value } } as any)}
                                    >
                                        <SelectTrigger className="bg-transparent rounded-sm">
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cologne">Cologne</SelectItem>
                                            <SelectItem value="eau-de-toillete">Eau de Toillete</SelectItem>
                                            <SelectItem value="eau-de-parfum">Eau de Parfum</SelectItem>
                                            <SelectItem value="parfum">Parfum</SelectItem>
                                            <SelectItem value="extrait-de-parfum">Extrait de Parfum</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label className="block text-sm font-medium text-gray-700">Volume</Label>
                                    <Input
                                        type="text"
                                        name="volume"
                                        value={product?.volume}
                                        onChange={handleInputChange}
                                        className='bg-white border-gray-200'
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.volume}</p>}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                </div>
                {/* END OF LEFT SECTION */}

                {/* PRODUCT MEDIA */}
                <div className="lg:col-span-5">
                    {/* product media */}
                    <Card className="mb-8 py-4 border-none bg-gray-50">
                        <CardContent>
                            <h2 className="text-xl font-semibold mb-4">Product Media</h2>
                            <p className="text-gray-500 mb-4">Photo Product</p>
                            <div className="border-2 border-dashed border-gray-400 p-4 bg-white">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    {(['mainImage', 'firstImage', 'secondImage', 'thirdImage'] as const).map((field) => (
                                        <div
                                            key={field}
                                            className="relative aspect-square border border-gray-300 bg-gray-50 flex justify-center items-center"
                                        >
                                            {product?.[field] && (
                                                <img
                                                    src={
                                                        product[field] instanceof File
                                                            ? URL.createObjectURL(product[field] as File)
                                                            : (product[field] as string)
                                                    }
                                                    alt="Uploaded preview"
                                                    className="absolute inset-0 object-cover w-full h-full"
                                                />
                                            )}
                                            <PlusIcon size={18} className="bg-slate-200 rounded-full p-1 font-thin" />
                                            <input
                                                type="file"
                                                onChange={(e) => {
                                                    handleImageUpload(e, field);
                                                }}
                                                accept="image/*"
                                                className="absolute cursor-pointer opacity-0 inset-0"
                                            />
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </CardContent>
                    </Card>

                    {/* category */}
                    <Card className='py-4 border-none bg-gray-50'>
                        <CardContent>
                            <h2 className="text-xl font-semibold mb-4">Category</h2>
                            <Select onValueChange={(value) => handleSelectChange('category', value)} value={product?.category}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map((category) => (
                                        <SelectItem key={category.name} value={category.name}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                </div>

            </div>
            {/* END OF THE FORM */}

            <div className='flex justify-evenly gap-4 '>
                <Button onClick={handleDiscardChanges} className='rounded-none w-40 border border-app-red text-app-red bg-white text-xs md:text-base hidden'>Discard Changes</Button>
                <Button type="submit" onClick={triggerSubmit} className={`rounded-none w-40 ${loadingUpdate ? 'bg-gray-700 cursor-not-allowed' : 'bg-[#3B9BCE]'}  text-xs md:text-base`} disabled={loadingUpdate}>
                    {
                        loadingUpdate ?
                            <span>Saving...</span>
                            :
                            <span>Save Changes</span>
                    }
                </Button>
            </div>
        </>


    )
};

export default EditProduct;