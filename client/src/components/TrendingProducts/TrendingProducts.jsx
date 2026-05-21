import { useState, useEffect } from 'react'
import ProductCard from '../ProductCard/ProductCard'
import './TrendingProducts.css'

const TrendingProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch trending products from API
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          'http://localhost:5000/api/trending-config',
        )
        if (response.ok) {
          const data = await response.json()
          const validProducts = data.filter((p) => p !== null)
          if (validProducts.length > 0) {
            setProducts(validProducts)
            // Dispatch resize event to force GSAP ScrollTrigger to recalculate 
            // the pin position of CategorySection after the DOM expands
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 500);
          }
        }
      } catch (error) {
        console.error('Error fetching trending products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (products.length === 0 && !loading) {
    return null // Don't render the section if no products are configured
  }

  return (
    <section className='trending-products'>
      <div className='container'>
        <div className='section-header'>
          <h2>Organic products that are currently trending</h2>
          <p>Discover our most popular products loved by customers worldwide</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Loading trending products...
          </div>
        ) : (
          <div className='trending-products-grid'>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className='trending-products-footer'>
          <a href='/products' className='btn btn-secondary'>
            View All Products
          </a>
        </div>
      </div>
    </section>
  )
}

export default TrendingProducts
