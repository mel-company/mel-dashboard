
import { pages } from '@/utils/pages';
import { useLocation } from 'react-router-dom'

export const usePage = () => {
    const location = useLocation();
    const pathname = location.pathname
    const currentPage = pages?.find(page => {
        if (!page.slug) return false;
        return pathname === page.slug || pathname.startsWith(`${page.slug}/`);
    })

    return {
        pages,
        pathname,
        currentPage
    }
}

