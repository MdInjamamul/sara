import Navbar from '../../components/Navbar/Navbar';
import Hero from '../../components/Hero/Hero';
import TrendingProducts from '../../components/TrendingProducts/TrendingProducts';
import CategorySection from '../../components/CategorySection/CategorySection';
import InfoBar from '../../components/InfoBar/InfoBar';
import Newsletter from '../../components/Newsletter/Newsletter';
import Footer from '../../components/Footer/Footer';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page">
            <Navbar />
            <main>
                <Hero />
                <TrendingProducts />
                <InfoBar />
                <CategorySection />
                <Newsletter />
            </main>
            <Footer />
        </div>
    );
};

export default Home;
