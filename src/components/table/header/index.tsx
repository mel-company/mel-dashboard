import FilterList from './filter'
import { Searchbar } from './searchbar'

const PageTableHeader = ({ children }: { children?: React.ReactNode }) => {
    return (
        <header className='flex flex-col sm:flex-row gap-2 sm:items-center justify-between'>
            <h2 className='text-2xl text-blue-950 dark:text-blue-100'>{"المنتجات"}</h2>
            <div className='flex items-center gap-2.5'>
                <Searchbar />
                <FilterList />
                {children && <div className='h-7 w-px bg-slate-200' />}
                {children}
            </div>
        </header>
    )
}

export default PageTableHeader