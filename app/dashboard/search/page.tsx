"use client"
import { Heading } from "@/components/heading"
import axios from "axios";
import { useSearchParams } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import Loading from "@/app/loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import NotFoundImg from '../../../public/images/not-found.png'
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface Product {
    _id: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
    totalPages: number;
}

interface searchResults {
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    totalPages: number;
    currentPage: number;
}

const Page = () => {
    const [searchQuery, setSearchQuery] = useState<string | null>(useSearchParams().get('s'))
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [searchResults, setSearchResult] = useState<searchResults>()
    const [searchedProducts, setsearchedProducts] = useState<Product[]>([])
    const [totalProducts, setTotalProducts] = useState<number>()
    const [canSearch, setCanSearch] = useState<boolean>(false)
    const [formData, setFormData] = useState({
        price: ''
    })
    const [loadingUpdate, setLoadingUpdate] = useState<boolean>(false)
    const { data: session } = useSession();
    const [loadedProduct, setLoadedProduct] = useState<string>('')

    useEffect(() => {
        // fetchProducts()
        handleSearchProduct(1)
        fetchCategories()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setFormData(prev => (
            {...prev, [name]: value}
        ))
        console.log(formData);
        
    }

    const handleSubmit = async (productId: string)=>{
        setLoadingUpdate(true)
        setLoadedProduct(productId)
        try {
        
            const response = await axios.put(`https://mkhasa-bfdb6fabd978.herokuapp.com/api/v1/product/${session?.user._id}/${productId}`, formData);
    
            setFormData(response.data.product.price)
            if (response.status) {
                toast.success('Price updated!')
            } else {
                const errorData = await response.data;
                console.error('Response Error:', errorData);
                toast.error(errorData.message)
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Error updating product');
        } finally {
            console.log('done!');
            setLoadingUpdate(false)
        }
    }



    useEffect(() => {
        filteredProducts()
    }, [selectedCategory])

    const filteredProducts = () => {
        // handleSearchProduct(1)
        const categoryName = selectedCategory == 'all' ? '' : selectedCategory;
        const products = searchedProducts.filter(product => product.category.includes(categoryName));
        setsearchedProducts(products)
        console.log(products);
        

    }



    const handleSearchProduct = async (pageNum: number) => {

        setLoadingProducts(true)
        try {
            const response = await axios(`https://mkhasa-bfdb6fabd978.herokuapp.com/api/v1/search?name=${searchQuery}&page=${pageNum}`)
            const data = response.data
            console.log(data);
            
            setSearchResult(data)
            setsearchedProducts(data.products)
            setTotalProducts(data.totalProducts)
            setCanSearch(false)
        } catch (error) {
            console.log(error)
        } finally {
            setLoadingProducts(false)

        }
    }

    const fetchCategories = async () => {
        try {
            const response = await fetch('https://mkhasa-bfdb6fabd978.herokuapp.com/api/v1/all/category');
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const data = await response.json();
            const categories = data.map((item: any) => item.name)
            setCategories(categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSearch = (query: string) => {
        setCanSearch(true)
        setSearchQuery(query)
        console.log(searchQuery);

    }

    const setCategory = (category: string) => {
        if (category == 'All' || category == 'all') {
            setSelectedCategory('')
        }


        setCurrentPage(1); // Reset to first page on category change
        setSelectedCategory(category)
    }

    if (!searchedProducts) {
        return <Loading />
    }




    return (
        <>
            <div className="max-w-[1140px] m-auto ">
                <Heading>Search</Heading>
                <p className="my-4 text-sm"> <span className="font-bold">{searchedProducts ? totalProducts : '0'} </span>results for '{searchQuery}' in <span className="font-bold">{selectedCategory == '' ? 'All categories' : selectedCategory + ' category'}</span> </p>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-4">
                    <form className=" flex gap-4 items-center bg-gray-100 p-2 max-w-[500px] rounded-[50px] shadow" onSubmit={(e) => {
                        e.preventDefault()
                        handleSearchProduct(1)
                    }}>
                        <input
                            id="search"
                            name="search"
                            type="text"
                            placeholder="search product"
                            value={searchQuery as string}
                            className="w-full flex-1 sm:w-2/4 px-4 rounded-full outline-none bg-gray-100"
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        {
                            canSearch && (
                                <button className="block bg-black text-white text-sm p-1 px-2 font-bold rounded-[50px]">Search</button>
                            )
                        }
                    </form>
                    <div className="hidden">
                        <Select onValueChange={(e) => { setCategory(e as string) }} defaultValue="">
                            <SelectTrigger className='bg-black text-white rounded-none w-36 font-semibold'>
                                <SelectValue placeholder='All Categories' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>All Categories</SelectItem>
                                {
                                    categories?.map(category => (
                                        <SelectItem value={category} key={category}>
                                            {category}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {!searchedProducts || loadingProducts ? <div className="py-16 text-center flex items-center justify-center border "><h1 className="text-center text-2xl text-gray-500">Searching for <span className="font-bold capitalize">{searchQuery}</span></h1></div> : (
                    <div className="my-8 ">
                        <div className="flex items-center justify-between  my-4 ">
                            <p className="flex-1 w-full">Page {searchResults?.currentPage} of {searchResults?.totalPages}</p>
                            <Pagination className=" w-fit">
                                <PaginationContent className="flex items-center gap-4 ">
                                    <PaginationItem >
                                        <button
                                            onClick={() => {
                                                if (searchResults?.hasPreviousPage) {
                                                    const pageNum = searchResults.currentPage - 1
                                                    handleSearchProduct(pageNum)
                                                }
                                            }}
                                            disabled={!searchResults?.hasPreviousPage}
                                            className={`${!searchResults?.hasPreviousPage ? 'pointer-events-none opacity-50' : ''}  flex items-center sm:border p-1 rounded hover:bg-black hover:text-white`}>

                                            <ChevronLeft className={` icon border sm:border-none`} />
                                            <span className="hidden sm:inline-block">Prev</span>
                                        </button>
                                    </PaginationItem>
                                    {/* {getPageNumbers(currentPage, totalPages, 5).map((page, index) => (
                                    <PaginationItem key={index} >
                                        {page === 'ellipsis' ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <PaginationLink href="#" onClick={() => handlePageChange(page as number)}
                                                className={currentPage === page ? 'bg-gray-200 text-black font-bold' : ''}
                                            >
                                                {page}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))} */}
                                    <PaginationItem>
                                        <button
                                            onClick={() => {
                                                if (searchResults?.hasNextPage) {
                                                    const pageNum = searchResults.currentPage + 1
                                                    handleSearchProduct(pageNum)
                                                }
                                            }}
                                            disabled={!searchResults?.hasNextPage}
                                            className={`${!searchResults?.hasNextPage ? 'pointer-events-none opacity-50 ' : ''}  flex items-center sm:border p-1 rounded hover:bg-black hover:text-white`}>
                                            <span className="hidden sm:inline-block">Next</span>
                                            <ChevronRight className="icon border sm:border-none" />
                                        </button>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>


                        <Table className="">
                            <TableHeader className="bg-gray-200">
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {searchedProducts?.length != 0 && searchedProducts?.map((product) => (
                                    <TableRow key={product._id}>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.category || 'N/A'}</TableCell>
                                        <TableCell className="text-green-500">
                                            <Dialog>
                                                <DialogTrigger>
                                                    <Button disabled={loadingUpdate && product._id === loadedProduct}>{loadedProduct === product._id && loadingUpdate ? 'Updating...' : 'Change Price'}</Button>
                                                </DialogTrigger>

                                                <DialogContent>
                                                    <DialogTitle>Change <span className="text-green-500">{product.name}</span> price</DialogTitle>
                                                    <form onSubmit={(e)=>{
                                                        e.preventDefault()
                                                        handleSubmit(product._id)}}>
                                                        <div className="mb-2 bg-gray-50 p-1 text-xs">
                                                            <span className=" font-semibold ">Old Price: </span>
                                                            <span>₦{product.price.toLocaleString()}</span>
                                                        </div>
                                                        
                                                        <div className="space-y-2 my-4">
                                                            <Label >New Price</Label>
                                                            <div className="flex items-center bg-gray-100 border rounded px-2">
                                                                {
                                                                    formData.price && (
                                                                        <span>₦</span>
                                                                    )
                                                                }
                                                                <Input placeholder={"₦40,000".toLocaleString()} className="border-none bg-transparent" onChange={handleInputChange} name="price"/>
                                                            </div>
                                                        </div>
                                                        <DialogClose>
                                                            <Button>Update</Button>
                                                        </DialogClose>
                                                    </form>

                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                                }
                            </TableBody>
                        </Table>

                        {
                            searchedProducts.length == 0 && (
                                <div className="my-16 text-center ">
                                    <Image src={NotFoundImg} alt="Not found image" className="m-auto w-1/4" />
                                    <h1 className="text-2xl text-gray-500">No result</h1>
                                </div>
                            )
                        }


                    </div>
                )}
            </div>

        </>
    );
}

export default Page;
