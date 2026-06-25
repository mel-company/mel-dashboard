export function DeleteProductModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    console.log('DeleteProductModal called with open:', open);

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/15 backdrop-blur-sm bg-opacity-50" onClick={() => onOpenChange(false)} />
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">Delete Product</h2>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this product? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                    <button
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        onClick={() => onOpenChange(false)}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteProductModal
