import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { Leaf } from 'lucide-react';
import MealDetailModal from '../components/MealDetailModal';
import { menuData } from '../data/menu';
import { useAdmin } from '../context/AdminContext';
import './Menu.css';

export default function Menu() {
  const { addToCart } = useCart();
  const { language, menu: contextMenu } = useAdmin();
  const activeMenuData = contextMenu && contextMenu.length > 0 ? contextMenu : menuData;

  const displayMenuData = React.useMemo(() => {
    let data = activeMenuData.map(cat => ({
      ...cat,
      items: cat.items.filter(item => !item.isSoldOut)
    })).filter(cat => cat.items.length > 0);

    const topSellers = [];
    data.forEach(cat => {
      cat.items.forEach(item => {
        if (item.isTopSeller) {
          topSellers.push(item);
        }
      });
    });

    if (topSellers.length > 0) {
      data = [
        { category: '🔥 EMPFEHLUNGEN', items: topSellers },
        ...data
      ];
    }
    return data;
  }, [activeMenuData]);

  const [activeCategory, setActiveCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    if (displayMenuData.length > 0 && !activeCategory) {
      setActiveCategory(displayMenuData[0].category);
    }
  }, [displayMenuData, activeCategory]);

  const categories = displayMenuData.map(c => c.category);
  const activeCategoryData = displayMenuData.find(c => c.category.toLowerCase() === (activeCategory || '').toLowerCase()) || displayMenuData[0];
  const filteredProducts = activeCategoryData ? activeCategoryData.items : [];

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const subcat = product.subcategory || '';
    if (!acc[subcat]) acc[subcat] = [];
    acc[subcat].push(product);
    return acc;
  }, {});

  const getCategoryVideos = (cat) => {
    const lower = cat.toLowerCase();
    if (lower.includes('burger')) return ['/Chef_serves_classic_hamburger_202608121746.mp4', '/burger_hero_video.mp4', '/Burger_B-roll_Ad_202608121704.mp4'];
    if (lower.includes('salat')) return ['/Salat_B-roll_Ad_202608121747.mp4', '/Salat_B-roll_Ad_202608121705.mp4'];
    if (lower.includes('schnitzel')) return ['/Schnitzel_B-roll_Ad_202608121747.mp4', '/Schnitzel_B-roll_Ad_202608121704.mp4'];
    if (lower.includes('snack')) return ['/Snacks_B-roll_Ad_202608121748.mp4', '/Currywurst_B-roll_Ad_1080p_202608121707.mp4', '/Currywurst_B-roll_Ad_202608121704.mp4', '/fries.mp4'];
    if (lower.includes('pasta') || lower.includes('nudel')) return ['/Fork_twirling_spaghetti_carbonara_202608121744.mp4', '/Spaghetti_B-roll_Ad_1080p_202608121708.mp4', '/Spaghetti_B-roll_Ad_202608121706.mp4'];
    if (lower.includes('pizzabrötchen') || lower.includes('calzone')) return ['/Slicing_open_calzone_pizza_202608121744.mp4', '/Pizzabrötchen_B-roll_Ad_1080p_202608121708.mp4', '/Pizzabrötchen_B-roll_Ad_202608121707.mp4'];
    if (lower.includes('croque') || lower.includes('fladenbrot')) return ['/Preparing_Fladenbrot_sandwich_202608121745.mp4', '/Croque_B-roll_Ad_1080p_202608121708.mp4', '/Croque_B-roll_Ad_202608121707.mp4'];
    if (lower.includes('wrap')) return ['/Knife_slicing_wrap_in_half_202608121745.mp4', '/XXL-Wrap_B-roll_Ad_1080p_202608121707.mp4', '/XXL-Wrap_B-roll_Ad_202608121705.mp4'];
    if (lower.includes('gyros')) return ['/Gyros_cooking_with_onions_mushrooms_202608121745.mp4', '/Gyros_B-roll_Ad_1080p_202608121708.mp4', '/Gyros_B-roll_Ad_202608121706.mp4'];
    if (lower.includes('döner')) return ['/Döner_B-roll_Ad_202608121743.mp4', '/Gyros_cooking_with_onions_mushrooms_202608121745.mp4'];
    if (lower.includes('fisch')) return ['/Seafood_plate_with_garlic_sauce_202608121746.mp4', '/Fisch_B-roll_Ad_1080p_202608121708.mp4'];
    if (lower.includes('reis') || lower.includes('aufläufe')) return ['/Spoon_scooping_hot_broccoli_cass…_202608121745.mp4', '/Reispfanne_B-roll_Ad_202608121707.mp4'];
    if (lower.includes('eis')) return ['/Eis-Vanille_B-roll_Ad_202608121830.mp4', '/Scooping_Cookie_Dough_Ice_Cream_202608121830.mp4'];
    if (lower.includes('cocktail') || lower.includes('kukki')) return ['/Stirring_Cookie_Mojito_cocktail_202608121831.mp4', '/Stirring_passionfruit_cocktail_i…_202608121831.mp4'];
    if (lower.includes('zigaretten') || lower.includes('tobacco')) return ['/Scotch_B-roll_Ad_(Pour)_202608121845.mp4', '/Stirring_Cookie_Mojito_cocktail_202608121831.mp4'];
    if (lower.includes('beilage') || lower.includes('extra')) return ['/Olives_and_peppers_mixing_202608121902.mp4', '/fries.mp4'];
    if (lower.includes('getränke') || lower.includes('drink')) return ['/Pouring_Coca-Cola_into_glass_202608121855.mp4', '/Red_Bull_B-roll_Ad_202608121856.mp4'];
    if (lower.includes('dessert') || lower.includes('nachtisch')) return ['/Scooping_Cookie_Dough_Ice_Cream_202608121830.mp4', '/Eis-Vanille_B-roll_Ad_202608121830.mp4'];
    if (lower.includes('kleinen') || lower.includes('kidd')) return ['/Kiddy_Box_B-roll_Ad_202608121705.mp4'];
    return ['/Commercial_ad_for_pizza_meal_202608121746.mp4', '/Lifting_slice_of_pizza_Margherita_202608121747.mp4', '/pizza_hero_video.mp4', '/pizza.mp4']; // fallback for pizza & hammer des tages
  };

  const categoryVideos = getCategoryVideos(activeCategory || '');
  const currentVideoSrc = categoryVideos[currentVideoIndex % categoryVideos.length];

  useEffect(() => {
    setCurrentVideoIndex(0);
  }, [activeCategory]);

  const handleVideoEnded = () => {
    setCurrentVideoIndex(prev => (prev + 1) % categoryVideos.length);
  };

  return (
    <>
      <div className="menu-split-container">
        {/* Left Side: Giant Image/Video representing Qitchen Style */}
        <div className="menu-split-left">
          <video 
            key={`${activeCategory}-${currentVideoSrc}`}
            autoPlay 
            muted 
            playsInline 
            onEnded={handleVideoEnded}
            className="menu-split-video"
          >
            <source src={currentVideoSrc} type="video/mp4" />
          </video>
          <div className="menu-split-left-overlay"></div>
          <motion.h1 
            key={`title-${activeCategory}`}
            className="menu-split-title"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            MENU
          </motion.h1>
        </div>

        {/* Right Side: List & Categories */}
        <div className="menu-split-right">
          
          <div className="menu-category-nav-wrapper">
            <div className="menu-category-nav">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`menu-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="category-header-row">
            <div className="category-header-line"></div>
            <h2>{(activeCategory || '').toUpperCase()}</h2>
            <div className="category-header-line"></div>
          </div>

          <div className="menu-split-list-container">
            <AnimatePresence mode='wait'>
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="menu-list"
              >
                {Object.entries(groupedProducts).map(([subcat, products]) => (
                  <React.Fragment key={subcat}>
                    {subcat !== '' && (
                      <div className="subcategory-header-row">
                        <div className="subcategory-header-line"></div>
                        <h3>{subcat.toUpperCase()}</h3>
                        <div className="subcategory-header-line"></div>
                      </div>
                    )}
                    {products.map((product, index) => {
                      const desc = typeof product.desc === 'object' ? (product.desc[language] || product.desc.de) : product.desc;
                      return (
                      <motion.div 
                        key={product.id}
                        className="menu-list-item"
                        onClick={() => setSelectedProduct({
                          id: product.id,
                          name: product.name,
                          price: parseFloat(product.price.split(' ')[0].replace(',', '.')) || 0,
                          description: desc,
                          imageUrl: product.image,
                          fullPrice: product.price,
                          category: activeCategory
                        })}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      >
                        <div className="menu-item-thumb">
                          <img src={product.image} alt={product.name} loading="lazy" />
                        </div>
                        <div className="menu-item-info">
                          <div className="menu-item-header">
                            <h3 className="menu-item-title">{`${product.id}. ${product.name}`.toUpperCase()}</h3>
                            <div className="menu-item-dots"></div>
                            <span className="menu-item-price">{product.price}</span>
                          </div>
                          <p className="menu-item-desc">{desc}</p>
                        </div>
                      </motion.div>
                    )})}
                  </React.Fragment>
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredProducts.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '50px 0' }}>
                Keine Gerichte in dieser Kategorie.
              </div>
            )}
          </div>
        </div>
      </div>

      <MealDetailModal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        product={selectedProduct} 
        addToCart={addToCart} 
      />
    </>
  );
}
