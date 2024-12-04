'use client'

import { Product, useProductContext } from '@/app/contexts/ProductsContext'
import { Heading } from '@/components/heading'
import FullPageLoader from '@/components/loader/FullPageLoader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'



const Page = () => {

    const [machingProucts, setMatchingProducts] = useState<Product[]>([])
    const [productsName, setProductsName] = useState<string>('')
    const [newPrice, setNewPrice] = useState<number | null>()
    const {  fetchProducts, loadingAllProducts, products, loadingProductUpdate, updatePriceInBulk } = useProductContext()
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
    const [error, setError] = useState<string>('')


    useEffect(()=>{
        if(products.length > 0){
            setMatchingProducts(products)
        }
    },[products])

    useEffect(() => {
        fetchProducts()
    }, [])

    const SearchProduct = (data: Product[], query: string) => {
        const results: Product[] = data.filter((product: Product) => product.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
        return results
    }

    const handleSearch = (query: string) => {
        if (products.length > 0) {
            const datas = SearchProduct(products, query)
            setMatchingProducts(datas)
        } else {
            toast.error('Something went wrong. Reload thisPpage.')
        }
    }

    const handleChangeName = (name: string) => {
        setProductsName(name)
        handleSearch(name)
        setError('')
    }

    const handleChangePrice = (price: number) => {
        setNewPrice(price)
    }

    // handle update 
    const handleUpdate = () => {
        if(!newPrice){
            toast.error('Price field is missing.')
            return
        }

        if(selectedProducts.length === 0){
            toast.error('You have not selected any product.')
            return
        }
        const price = Number(newPrice)
        const selectedProductsIds: string[] = selectedProducts.map((product: Product) => product._id)
        
        const res = updatePriceInBulk(selectedProductsIds, price)
        setSelectedProducts([])
        setProductsName('')
        setNewPrice(null)
        
    }

    const handleAddProduct = (productId: string) => {
        let newProduct: any = products.find((product: any) => product._id == productId)
        if (newProduct) {
            setSelectedProducts((prevProducts: any) => {
                const productExists = prevProducts.some((product: any) => product._id === newProduct._id);
                if (!productExists) {
                    return [...prevProducts, newProduct];
                }
                return prevProducts;
            });
        }
        console.log(selectedProducts);
    }
    const handleRemoveProduct = (productId: string) => {
        const newSelectedProducts: any = selectedProducts.filter((product: any)=> product._id !== productId)
        setSelectedProducts(newSelectedProducts)
        console.log(selectedProducts);
        
    }

    const handlechecked = (checked:  boolean, productId: string)=>{
        checked ?
        handleAddProduct(productId) :
        handleRemoveProduct(productId)

    }

    return (
        <div className='max-w-[700px] m-auto'>
            <Heading className='mb-2 text-lg'>Update prices in bulk.</Heading>

            {
                loadingAllProducts ?
                    <FullPageLoader title='Hold On!' text='Fetching Products...' /> :
                    <>
                        <form action="" className='bg-black text-white p-2 z-30 gap-4 sticky top-[2rem]  sm:flex items-center justify-end' onSubmit={(e) => {
                            e.preventDefault()
                            handleUpdate()
                        }}>
                            <div className='w-full mb-2'>

                                <Input value={productsName} onChange={(e) => { handleChangeName(e.target.value) }} className={`${error ? 'border-red-500' : ''} border-white bg-gray50 placeholder-gray-600 text-black`} placeholder='Search product' />
                                {
                                    error &&
                                    <p className={`text-red-500 text-xs mt-2`}>Add products name first</p>
                                }
                            </div>
                            <Input placeholder='New Price' value={newPrice as number} onChange={(e) => { handleChangePrice(Number(e.target.value)) }} type='number' className='border-white bg-gray50 placeholder-gray-600 text-black' />
                            {
                                !loadingProductUpdate ?
                                    <Button className='mt-4 bg-blue-500 relative'>
                                        <span>Update</span>
                                        {
                                            selectedProducts.length > 0 && (
                                                <span className='bg-app-red min-h-[20px] min-w-[20px] text-xs rounded-full text-white p-1 flex justify-center items-center top-[-10px] right-[-10px] absolute'>{selectedProducts.length}</span>
                                            )
                                        }
                                    </Button> :
                                    <Button className='bg-gray-400'>
                                        <Loader className='animate-spin' />
                                    </Button>

                            }
                        </form>




                        {/* PRODUCTS */}
                        <section className=' max-h-[70vh] overflow-y-scroll pb-8 bg-white shadow-lg mt-4 mb-16'>


                            <Table className='shadow-lg mb-4'>
                                <TableHeader className='bg-gray-200">'>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Price</TableHead>

                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {
                                        machingProucts.map(product => (
                                            <TableRow key={product._id}>
                                                <TableCell>{product.name}</TableCell>
                                                <TableCell className='flex items-center '>₦<span>{product.price.toLocaleString()}</span>
                                                   
                                                </TableCell>
                                                <TableCell>
                                                <input type='checkbox' className='ml-2 size-5' onChange={(e)=>{handlechecked(e.target.checked, product._id)}}/>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>

                            <div className='h-[20px] bg-white shadow-lg border fixed bottom-0 left-0 w-full'></div>
                        </section>

                        {/* END OF PRODUCTS */}
                    </>
            }





        </div>
    )
}

export default Page
