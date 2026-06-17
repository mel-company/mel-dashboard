import type { PageType } from '@/types/pages';
import { useEffect, useRef, useState } from 'react'

const useTableHeader = ({ page }: { page: PageType }) => {
    const [loading, setLoading] = useState(false);
    const [search, setSearchValue] = useState('');
    const [filter, setFilter] = useState('');
    const [data, setData] = useState(
        {
            records: 0,
            pages: 0,
            current: 1,
        }
    )

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(async () => {
            setLoading(true)
            const result = await handleSearch({ page, search, filter })
            if (result) setData(result)
            setLoading(false)
        }, 300)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [search, filter, page])


    return {
        search,
        setSearchValue,
        filter,
        setFilter,
        data,
        loading,
    }
}

export default useTableHeader

const queryEndpoints: Record<PageType, string> = {
    coupons: "/coupons",
    products: "/products",
}


const handleSearch = async ({ page, search, filter }: { page: PageType; search: string; filter: string }) => {
    const base_url = import.meta.env.VITE_API_URL;
    const endpoint = queryEndpoints[page];
    const path = `${endpoint}?query=${search}&filter=${filter}`;

    try {
        const response = await fetch(`${base_url}${path}`)
        const data = await response.json()
        return data
    }
    catch (error) {
        console.error(error)
        return null
    }
}
