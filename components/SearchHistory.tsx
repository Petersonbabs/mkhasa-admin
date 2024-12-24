import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface SearchHistoryItem {
    name: string;
    timestamp: string;
}

const SearchHistory = () => {
    const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])

    const fetchSearchHistory = async () => {
        console.log('Fetching history...');

        try {
            const res = await axios(`https://mkhasa-bfdb6fabd978.herokuapp.com/api/v1/all/searched/product`)
            const data = res.data
            setSearchHistory(data)

        } catch (error) {
            console.log(error);
        } finally {
            console.log('Done!');

        }
    }

    const formatDate = (timestamp: string)=>{

    
        const date = new Date(timestamp);
    
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        };
    
        // Display in local time
        const formattedDate = date.toLocaleString('en-US', {weekday: 'short', day: 'numeric', month: 'short'});
        return formattedDate
    }



    useEffect(() => {
        fetchSearchHistory()
    }, [])

    return (
        <div>
            {
                searchHistory ?
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No.</TableHead>
                                <TableHead>Search</TableHead>
                                <TableHead>Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                searchHistory?.slice(0, 20).map((item, index) => (
                                    <TableRow>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item?.name}</TableCell>
                                        <TableCell>{formatDate(item?.timestamp)}</TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                    :
                    <></>
            }
        </div>
    )
}

export default SearchHistory
