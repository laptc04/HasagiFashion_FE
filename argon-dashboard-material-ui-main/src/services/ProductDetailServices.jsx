import apiClient from "config/axiosConfig";

const ProductDetailService = {
    getAllByProductId: id => apiClient.get(`/admin/product-detail/product/${id}`),
    getAllProductDetails: () => apiClient.get('/admin/product-detail'),
    createDetail: (data) => apiClient.post('/admin/product-detail', data),
    updateDetail: (id, data) => apiClient.put(`/admin/product-detail/${id}`, data),
    getById: id => apiClient.get(`/admin/product-detail/${id}`),
    delete: id => apiClient.delete(`/admin/product-detail/${id}`),
    getAllProductDetailsUS: () => apiClient.get('/user/product-detail'),
}


export default ProductDetailService;