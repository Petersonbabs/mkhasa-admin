'use client'

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader, Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner'
import { Heading } from '@/components/heading';
import { useProductContext } from '@/app/contexts/ProductsContext';



interface Product {
    _id: string;
    name: string;
    category?: string;
    price?: number;
    checked: boolean;
    FBT: string[];
    similar: string[];
    mainImage: string;
}

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div>
    </div>
);

const SimilarProducts = () => {
    const { id } = useParams()
    const { products, fetchProductById, fetchProducts, loadingAllProducts, loadingFbt } = useProductContext()
    const { data: session } = useSession()
    // const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    // const [loadingFbt, setLoadingFbt] = useState(false)
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [checkProducts, setCheckProducts] = useState<Product[]>([])
    const [ppSearchPreview, setPpSeachPreview] = useState<Product[]>([])
    const [ppQuery, setPPQuery] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState(''); 
    const [primaryProduct, setPrimaryProduct] = useState<Product>()
    const [similarProducts, setSimilarProducts] = useState<Product[]>([])

    useEffect(() => {
        // fetchData();
        fetchProducts()
        const fetchProduct = async () => {
            const product = await fetchProductById(id as string)
            const similar = product?.similar
            setSimilarProducts(similar as any)
            setPrimaryProduct(product as any)
        }
        if (id) {
            fetchProduct()
        }
    }, []);

    const searchPrimaryProduct = (theSearchQuery: string) => {
        setPPQuery(theSearchQuery)
        const results: any = products.filter(product => product.name.toLowerCase().includes(theSearchQuery.toLowerCase())).slice(0, 10)
        setPpSeachPreview(results)
    }

    const selectPrimaryProduct = (productId?: string) => {
        fetchIndividualProduct(productId as string)
        setPPQuery('')
    }

    const clearPrimaryProduct = () => {
        setPrimaryProduct(undefined)
    }


    const fetchIndividualProduct = async (productId: string) => {
        const product = await fetchProductById(productId)
        
        const similar = product?.similar
        setSimilarProducts(similar as any)
        setPrimaryProduct(product as any)
    };

    const handleSaveAndContinue = async (productId: string) => {
        setLoading(true);
        const similarProductsIds = similarProducts.filter(item => item._id).map(item => item._id)

        try {
            const response = await fetch(`https://mkhasa-bfdb6fabd978.herokuapp.com/api/v1/similar/product/66542da6f1f73b11f47b728a/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'  // Specify that the request body is JSON
                },
                body: JSON.stringify({ similar: similarProductsIds })
            });
            const data = await response.json()
            if (!response.ok) {throw new Error('Failed to update simiilar product')} else{toast.success('Similar products updated!')};

            // toast.success('frequently bought product updated successfully');
        } catch (error) {
            console.error('Error updating frequently bought product:', error);
            // toast.error('An error occurred while updating frequently bought product', { position: 'top-right' });
        } finally {
            setLoading(false);
        }
    };


    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddProduct = (productId: string) => {
        let newProduct: any = products.find((product: any) => product._id == productId)
        if (newProduct) {
            setSimilarProducts((prevProducts: any) => {
                const productExists = prevProducts.some((product: any) => product._id === newProduct._id);
                if (!productExists) {
                    return [...prevProducts, newProduct];
                }
                return prevProducts;
            });
        }
    };

    const handleRemoveProduct = (productId: string) => {
        let newProducts: any = similarProducts.filter((product: any) => product._id !== productId)
        setSimilarProducts(newProducts)
    };


    return (
        <div className='max-w-[1140px] m-auto'>
            <Heading>Similar Products</Heading>

            {/* Select primary product */}
            <div className='my-8'>
                <h3 className='py-2 px-6 font-semibold bg-gray-100 w-fit text-sm'>Select primary product</h3>
                <div className='my-4 border flex flex-col sm:flex-row'>
                    {/* left */}
                    <div className='flex-1 p-4'>
                        {/* search area */}
                        <div className='flex items-center gap-4 bg-gray-100 rounded-[50px] px-4 relative mb-4'>
                            <Search className='icon' />
                            <Input placeholder='Search primary product' className='border-none' onChange={(e) => {
                                searchPrimaryProduct(e.target.value)
                            }} value={ppQuery} />
                            <ul className={`absolute top-[2.8rem] left-0 z-40 rounded bg-white shadow-md p-4 w-full  ${!ppQuery && 'hidden'}`}>
                                {
                                    ppSearchPreview?.length > 0 ?
                                        ppSearchPreview?.map((ele, index) => {
                                            return (
                                                <li className='flex gap-4 items-center justify-between mb-2 p-2 bg-gray-50 hover:bg-gray-100 cursor-pointer text-sm' onClick={() => { selectPrimaryProduct(ele._id) }} key={index}>
                                                    <span>{ele.name}</span>
                                                </li>
                                            )
                                        })
                                        :
                                        <div className='flex justify-center items-center text-gray-400 min-h-[80px]'>
                                            {
                                                loadingAllProducts || loading ?
                                                    <Loader className='animate-spin ' /> :
                                                    <span>No result!</span>
                                            }
                                        </div>
                                }
                            </ul>
                        </div>
                        {
                            loadingFbt || loadingAllProducts || loading ?
                                <div className='flex justify-center py-8 items-center bg-gray-50'>

                                    <Loader className='animate-spin ' />
                                </div>
                                :
                                <>
                                    {!primaryProduct ?
                                        // no selected product
                                        <div className='text-center py-8 text-gray-400 bg-gray-50'>
                                            <span>No product selected</span>
                                        </div>
                                        :
                                        // selected product preview
                                        <div className=' gap-4 justify-between items-center bg-gray-50 p-2'>
                                            <div className='flex flex-1 gap-4 sm:gap-2 items-center justify-between'>
                                                <div className='w-2/4 max-w-[70px] bg-gray-100 hidden sm:block'>
                                                    <img src={primaryProduct.mainImage} alt='Selected product' className='w-full' />
                                                </div>
                                                <h3>{primaryProduct.name}</h3>
                                                <div className='ml-4'>

                                                    <button className='bg-gray-200 p-1 hover:bg-gray-300'
                                                        onClick={clearPrimaryProduct}><X className='size-4 text-red-500 ' /></button>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </>
                        }


                    </div>
                    {/* end of left */}


                    {/* right */}
                    <div className='w-full sm:w-3/5 flex items-center flex-col sm:flex-row gap-4 justify-center'>
                        {/* image */}
                        <div className='w-full  sm:w-[140px] h-full  flex items-center bg-gray-100'>
                            {
                                !primaryProduct ?
                                    <>{
                                        loadingAllProducts || loadingFbt ?
                                            <div className='flex justify-center h-full w-full items-center bg-gray-50 '>
                                                <Loader className='animate-spin ' />
                                            </div>
                                            :
                                            <div className='text-center py-8 text-gray-400 bg-gray-50'>
                                                <span>No product selected</span>
                                            </div>
                                    }
                                    </>
                                    :
                                    <>
                                        {
                                            loadingFbt || loadingAllProducts ?
                                                <div className='py-8 flex justify-center items-center w-full'>
                                                    <Loader className='animate-spin ' />
                                                </div> :
                                                <img src={primaryProduct?.mainImage} alt={`${primaryProduct?.name} product image`} className='w-full h-full object-cover' />
                                        }
                                    </>
                            }
                        </div>

                        {
                            !primaryProduct ?
                                <>
                                    {
                                        loadingAllProducts || loadingFbt ?
                                            <div className='flex justify-center h-full w-full items-center bg-gray-50 '>
                                                <Loader className='animate-spin ' />
                                            </div>
                                            :
                                            <div className='text-center py-8 text-gray-400 bg-gray-50 w-full'>
                                                <span>No product selected</span>
                                            </div>
                                    }
                                </>
                                :
                                <>
                                    {
                                        loadingFbt || loadingAllProducts ?
                                            <div className='py-8 flex justify-center items-center w-full'>
                                                <Loader className='animate-spin ' />
                                            </div>
                                            :
                                            <div className='sm:p-4 space-y-1'>
                                                <div >
                                                    <span className='text-gray-400 text-xs'>Product name</span>
                                                    <h2 className='text-3xl font-bold'>{primaryProduct?.name}</h2>
                                                </div>
                                                <div>
                                                    <span className='text-gray-400 text-xs'>Category</span>
                                                    <h3>{primaryProduct?.category}</h3>
                                                </div>
                                                <div>
                                                    <span className='text-gray-400 text-xs'>Price</span>
                                                    <h2>₦{primaryProduct?.price?.toLocaleString()}</h2>
                                                </div>
                                            </div>
                                    }

                                </>
                        }

                    </div>
                    {/* end of right */}
                </div>
            </div>
            {/* end of Select primary product */}

            {/* ADD FREQUENTLY BOUGHT PRODUCT */}
            {
                primaryProduct && (
                    <div className='mb-8'>
                        <h2 className="font-semibold text-center md:text-left bg-gray-50 py-4 pl-2 mb-6 text-xl">Add Similar Product</h2>
                        <form className="w-full hidden lg:max-w-[50%] relative mb-8 lg:mt-0 search-form" onSubmit={(e) => e.preventDefault()}>
                            <div className='flex items-center gap-4 bg-gray-100 rounded-[50px] px-4 relative mb-12'>
                                <Search className='icon' />
                                <Input
                                    id="search"
                                    name="search"
                                    type="text"
                                    placeholder="Search By Name"
                                    className="border-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {
                                    searchQuery && (
                                        <X className='size-5 cursor-pointer text-red-500 hover:border rounded-full border-red-500' onClick={() => { setSearchQuery('') }} />
                                    )
                                }
                                <ul className={`absolute top-[2.8rem] left-0 z-40 rounded bg-white shadow-md p-4 border w-full search-result overflow-y-scroll max-h-80 ${!searchQuery && 'hidden'}`}>
                                    {
                                        filteredProducts?.length > 0 ?
                                            filteredProducts?.map((ele, index) => {
                                                const isProductChecked = similarProducts.some(product => product._id === ele._id);
                                                return (
                                                    <li className='flex gap-4 items-center justify-between mb-2 p-2 bg-gray-50 hover:bg-gray-100 cursor-pointer text-sm' key={index}>
                                                        <span className='flex-1'>{ele.name}</span>
                                                        <span className='flex gap-2 items-center'>
                                                            {
                                                                isProductChecked ?
                                                                    <button className='border py-1 px-4  hover:bg-gray-300'
                                                                        onClick={() => { handleRemoveProduct(ele._id) }}
                                                                    > <X className='cursor-pointer text-red-600 icon ' /></button>
                                                                    :
                                                                    <button className='bg-black py-1 px-4 text-white'
                                                                        onClick={() => { handleAddProduct(ele._id) }}
                                                                    > <Plus className='icon' /></button>

                                                            }

                                                        </span>
                                                    </li>
                                                )
                                            })
                                            :
                                            <div className='flex justify-center items-center text-gray-400 min-h-[80px]'>
                                                <span>No result!</span>
                                            </div>
                                    }
                                </ul>
                            </div>
                            <button
                                aria-label="search for product"
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                type="submit"
                            >
                            </button>
                        </form>
                    </div>
                )

            }
            {/* END OF ADD FREQUENTLY BOUGHT PRODUCT */}

            {/* FBT TABLE */}
            {
                primaryProduct && (
                    <div className="mb-6">
                        {loadingFbt || loading ?
                            <LoadingSpinner />
                            :

                            <>
                                {
                                    similarProducts.length !== 0 ?
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
                                                {similarProducts.map((product) => (
                                                    <TableRow key={product._id}>
                                                        <TableCell>{product.name}</TableCell>
                                                        <TableCell>{product.category || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <span className={product.price && product.price > 0 ? 'text-green-500' : 'text-red-500'}>
                                                                {product.price && product.price > 0 ? 'In Stock' : 'Out of Stock'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>{product.price ? `₦${product.price.toLocaleString()}` : 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <X className='cursor-pointer text-red-600 size-5 ml-3' onClick={() => { handleRemoveProduct(product._id) }} />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        :
                                        <div className='py-16 text-center bg-gray-50 text-gray-400'>
                                            <p>This product has no similar products</p>
                                        </div>
                                }
                            </>
                        }
                    </div>
                )
            }
            {/* FBT TABLE */}

            {
                primaryProduct && (
                    <Button
                        className="w-full mb-6 rounded-none bg-black"
                        onClick={
                            () => {
                                handleSaveAndContinue(primaryProduct._id)
                            }
                        }
                        disabled={loading}
                    >
                        {loading ? <LoadingSpinner /> : 'Save & Continue'}
                    </Button>
                )
            }

            {
                primaryProduct && (
                    <div>
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
                                <Search />
                            </button>
                        </form>
                        {loadingProducts ? (
                            <LoadingSpinner />
                        ) : (
                            <ul className="space-y-2 w-full lg:w-[60%]">
                                {filteredProducts.map((product) => {

                                    const isProductChecked = similarProducts?.some(item => item._id === product._id)
                                    return <li key={product._id} className="flex justify-between w-full items-center">
                                        <span className='line-clamp-1'>{product.name}</span>
                                        <div className='flex gap-3'>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className='hover:bg-black hover:text-white rounded-none'
                                                onClick={() => handleAddProduct(product._id)}
                                                disabled={isProductChecked}
                                            >
                                                {isProductChecked ? 'Added' : '+'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className='hover:bg-black hover:text-white rounded-none'
                                                onClick={() => handleRemoveProduct(product._id)}
                                                disabled={!isProductChecked}
                                            >
                                                -
                                            </Button>
                                        </div>
                                    </li>
                                }
                                )}
                            </ul>
                        )}
                    </div>
                )
            }



        </div>
    )
}

export default SimilarProducts
