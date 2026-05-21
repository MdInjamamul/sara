// Shared product data — used as fallback when API is unavailable
// This mirrors the seed data from the server

export const allProducts = [
    // ========== Medicinal Herbs ==========
    {
        name: 'Yarsagumba (Yarsha)',
        slug: 'yarsagumba-yarsha',
        shortDescription: 'Premium Himalayan Cordyceps for energy and vitality',
        description: 'Yarsagumba, also known as Himalayan Gold, is a rare and precious medicinal fungus found in the high altitudes of Nepal. It has been used for centuries to boost energy, enhance stamina, and support overall wellness.',
        price: 15000,
        discountPrice: 12999,
        categorySlug: 'medicinal-herbs',
        images: ['/assets/images/products/yarsagumba_yarsha.png'],
        isFeatured: true, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Boosts energy and stamina', 'Supports immune system', 'Enhances vitality', 'Natural adaptogen'],
        howToUse: 'Take 1-2 pieces daily with warm milk or water. Can also be added to tea.',
        ingredients: ['100% Pure Cordyceps Sinensis']
    },
    {
        name: 'Ginseng',
        slug: 'ginseng',
        shortDescription: 'Natural energy booster and stress reliever',
        description: 'Premium quality Ginseng root known for its powerful adaptogenic properties. Helps reduce stress, boost energy levels, and improve mental clarity.',
        price: 2500,
        discountPrice: null,
        categorySlug: 'medicinal-herbs',
        images: ['/assets/images/products/ginseng.png'],
        isFeatured: true, isNew: true, isBestseller: false, inStock: true,
        benefits: ['Reduces stress and fatigue', 'Improves mental clarity', 'Boosts immune system', 'Enhances physical endurance'],
        howToUse: 'Add 1 teaspoon to hot water or tea. Consume once daily.',
        ingredients: ['100% Pure Panax Ginseng Root']
    },
    {
        name: 'Shilajit',
        slug: 'shilajit',
        shortDescription: 'Himalayan mineral resin for strength and rejuvenation',
        description: 'Pure Himalayan Shilajit, a powerful mineral-rich resin formed over centuries. Known for its rejuvenating properties and ability to enhance physical performance.',
        price: 3500,
        discountPrice: 2999,
        categorySlug: 'medicinal-herbs',
        images: ['/assets/images/products/shilajit.png'],
        isFeatured: true, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Enhances strength and stamina', 'Rich in fulvic acid and minerals', 'Supports healthy aging', 'Boosts testosterone naturally'],
        howToUse: 'Dissolve a pea-sized amount in warm milk or water. Take once daily.',
        ingredients: ['100% Pure Himalayan Shilajit']
    },
    {
        name: 'Ashwagandha',
        slug: 'ashwagandha',
        shortDescription: 'Ancient herb for stress relief and vitality',
        description: 'Organic Ashwagandha root powder, an ancient Ayurvedic herb known for reducing stress, improving sleep quality, and boosting overall energy levels.',
        price: 1200,
        discountPrice: null,
        categorySlug: 'medicinal-herbs',
        images: ['/assets/images/products/ashwagandha.png'],
        isFeatured: false, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Reduces anxiety and stress', 'Improves sleep quality', 'Boosts energy levels', 'Supports muscle growth'],
        howToUse: 'Mix 1/2 teaspoon with warm milk before bedtime.',
        ingredients: ['100% Organic Ashwagandha Root Powder']
    },
    {
        name: 'Asparagus Powder',
        slug: 'asparagus-powder',
        shortDescription: 'Nutrient-rich powder for hormonal balance',
        description: "Pure Asparagus (Shatavari) powder, traditionally used for women's health and hormonal balance. Rich in antioxidants and essential nutrients.",
        price: 800,
        discountPrice: null,
        categorySlug: 'medicinal-herbs',
        images: ['/assets/images/products/asparagus_powder.png'],
        isFeatured: false, isNew: true, isBestseller: false, inStock: true,
        benefits: ['Supports hormonal balance', 'Rich in antioxidants', 'Enhances digestive health', 'Boosts immunity'],
        howToUse: 'Mix 1 teaspoon with water or smoothie. Take twice daily.',
        ingredients: ['100% Pure Asparagus Racemosus Powder']
    },
    {
        name: 'Mucuna',
        slug: 'mucuna',
        shortDescription: 'Natural dopamine booster for mood and focus',
        description: 'Organic Mucuna pruriens powder, a natural source of L-DOPA. Supports mood enhancement, focus, and cognitive function.',
        price: 950,
        discountPrice: null,
        categorySlug: 'medicinal-herbs',
        images: ['/assets/images/products/mucuna.png'],
        isFeatured: false, isNew: false, isBestseller: false, inStock: true,
        benefits: ['Natural mood enhancer', 'Improves focus and concentration', 'Supports healthy sleep', 'Boosts motivation'],
        howToUse: 'Take 1/2 teaspoon with warm water in the morning.',
        ingredients: ['100% Organic Mucuna Pruriens Seed Powder']
    },
    {
        name: 'Saw Palmetto',
        slug: 'saw-palmetto',
        shortDescription: 'Natural support for prostate health',
        description: "Premium Saw Palmetto extract for men's health. Traditionally used to support prostate health and hormonal balance.",
        price: 1800,
        discountPrice: 1499,
        categorySlug: 'medicinal-herbs',
        images: ['/assets/images/products/saw_palmetto.png'],
        isFeatured: false, isNew: false, isBestseller: false, inStock: true,
        benefits: ['Supports prostate health', 'Promotes hormonal balance', 'May support hair health', 'Natural anti-inflammatory'],
        howToUse: 'Take 1 capsule twice daily with meals.',
        ingredients: ['Saw Palmetto Berry Extract']
    },
    {
        name: 'Brahmi',
        slug: 'brahmi',
        shortDescription: 'Brain tonic for memory and cognitive health',
        description: 'Pure Brahmi (Bacopa monnieri) powder, an ancient Ayurvedic brain tonic. Enhances memory, concentration, and overall cognitive function.',
        price: 700,
        discountPrice: null,
        categorySlug: 'medicinal-herbs',
        images: ['/assets/images/products/brahmi.png'],
        isFeatured: true, isNew: false, isBestseller: false, inStock: true,
        benefits: ['Enhances memory', 'Improves concentration', 'Reduces anxiety', 'Supports brain health'],
        howToUse: 'Mix 1/2 teaspoon with warm water or milk. Take twice daily.',
        ingredients: ['100% Pure Bacopa Monnieri Powder']
    },

    // ========== Natural Essential Oils ==========
    {
        name: 'Rose Oil',
        slug: 'rose-oil',
        shortDescription: 'Premium rose essential oil for skin and aromatherapy',
        description: 'Pure rose essential oil extracted from fresh rose petals. Perfect for skincare, aromatherapy, and natural perfumery.',
        price: 2500, discountPrice: null, categorySlug: 'essential-oils',
        images: ['/assets/images/products/rose_oil.png'],
        isFeatured: true, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Moisturizes skin', 'Calming aromatherapy', 'Natural fragrance', 'Anti-aging properties'],
        howToUse: 'Add 2-3 drops to carrier oil for skin application or use in diffuser.',
        ingredients: ['100% Pure Rosa Damascena Oil']
    },
    {
        name: 'Lavender Oil',
        slug: 'lavender-oil',
        shortDescription: 'Calming lavender oil for sleep and relaxation',
        description: 'Premium lavender essential oil known for its soothing properties. Perfect for promoting relaxation and better sleep.',
        price: 1200, discountPrice: 999, categorySlug: 'essential-oils',
        images: ['/assets/images/products/lavender_oil.png'],
        isFeatured: true, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Promotes better sleep', 'Reduces stress', 'Soothes skin irritation', 'Natural air freshener'],
        howToUse: 'Add to diffuser before bedtime or apply diluted to temples.',
        ingredients: ['100% Pure Lavandula Angustifolia Oil']
    },
    {
        name: 'Tea Tree Oil',
        slug: 'tea-tree-oil',
        shortDescription: 'Antibacterial tea tree oil for skin health',
        description: 'Pure tea tree essential oil with powerful antibacterial and antifungal properties. Essential for natural skincare routines.',
        price: 900, discountPrice: null, categorySlug: 'essential-oils',
        images: ['/assets/images/products/tea_tree_oil.png'],
        isFeatured: false, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Fights acne and blemishes', 'Antibacterial properties', 'Soothes skin', 'Natural cleanser'],
        howToUse: 'Apply diluted to affected areas or add to skincare products.',
        ingredients: ['100% Pure Melaleuca Alternifolia Oil']
    },
    {
        name: 'Eucalyptus Oil',
        slug: 'eucalyptus-oil',
        shortDescription: 'Respiratory support and natural decongestant',
        description: 'Pure eucalyptus essential oil known for its powerful respiratory benefits. Helps clear congestion and purify the air.',
        price: 550, discountPrice: null, categorySlug: 'essential-oils',
        images: ['/assets/images/products/eucalyptus_oil.png'],
        isFeatured: false, isNew: false, isBestseller: false, inStock: true,
        benefits: ['Clears congestion', 'Purifies air', 'Cooling effect', 'Supports respiratory health'],
        howToUse: 'Add to steam inhalation or use in diffuser. Apply diluted to chest.',
        ingredients: ['100% Pure Eucalyptus Globulus Oil']
    },

    // ========== Natural Herbal Oils ==========
    {
        name: 'Black Seed Oil',
        slug: 'black-seed-oil',
        shortDescription: 'The blessed seed oil for immunity and wellness',
        description: 'Cold-pressed black seed (Nigella sativa) oil, known as the blessed seed. Powerful immune booster with numerous health benefits.',
        price: 1800, discountPrice: 1499, categorySlug: 'herbal-oils',
        images: ['/assets/images/products/black_seed_oil.png'],
        isFeatured: true, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Boosts immunity', 'Anti-inflammatory', 'Supports digestion', 'Promotes healthy skin'],
        howToUse: 'Take 1 teaspoon daily on empty stomach or add to food.',
        ingredients: ['100% Cold-Pressed Nigella Sativa Oil']
    },
    {
        name: 'Hemp Seed Oil',
        slug: 'hemp-seed-oil',
        shortDescription: 'Nutrient-dense oil for skin and overall wellness',
        description: 'Cold-pressed hemp seed oil with a perfect balance of omega fatty acids. Great for skin health and nutritional supplementation.',
        price: 1500, discountPrice: null, categorySlug: 'herbal-oils',
        images: ['/assets/images/products/hemp_seed_oil.png'],
        isFeatured: false, isNew: true, isBestseller: false, inStock: true,
        benefits: ['Balanced omega fatty acids', 'Nourishes skin', 'Supports immunity', 'Anti-inflammatory'],
        howToUse: 'Take 1 tablespoon daily or apply topically to skin and hair.',
        ingredients: ['100% Cold-Pressed Cannabis Sativa Seed Oil']
    },
    {
        name: 'Almond Oil',
        slug: 'almond-oil',
        shortDescription: 'Premium oil for skin and hair nourishment',
        description: 'Cold-pressed sweet almond oil, rich in vitamin E and essential fatty acids. Perfect for skin and hair care.',
        price: 850, discountPrice: null, categorySlug: 'herbal-oils',
        images: ['/assets/images/products/almond_oil.png'],
        isFeatured: false, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Moisturizes skin', 'Strengthens hair', 'Rich in vitamin E', 'Reduces dark circles'],
        howToUse: 'Apply to skin and hair. Can be used as massage oil or makeup remover.',
        ingredients: ['100% Cold-Pressed Prunus Dulcis Oil']
    },
    {
        name: 'Extra Virgin Coconut Oil',
        slug: 'virgin-coconut-oil',
        shortDescription: 'Multi-purpose oil for cooking, skin, and hair',
        description: 'Premium extra virgin coconut oil, cold-pressed from fresh coconuts. Versatile oil for cooking, skincare, and haircare.',
        price: 750, discountPrice: 599, categorySlug: 'herbal-oils',
        images: ['/assets/images/products/virgin_coconut_oil.png'],
        isFeatured: true, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Healthy cooking oil', 'Deep hair conditioning', 'Natural moisturizer', 'Boosts metabolism'],
        howToUse: 'Use for cooking, apply to skin and hair, or take 1 tablespoon daily.',
        ingredients: ['100% Cold-Pressed Extra Virgin Cocos Nucifera Oil']
    },

    // ========== Superfoods ==========
    {
        name: 'Chia Seeds',
        slug: 'chia-seeds',
        shortDescription: 'Omega-rich superfood for energy and nutrition',
        description: 'Organic chia seeds packed with omega-3, fiber, and protein. Perfect addition to smoothies, yogurt, and baked goods.',
        price: 650, discountPrice: null, categorySlug: 'superfoods',
        images: ['/assets/images/products/chia_seeds.png'],
        isFeatured: true, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Rich in omega-3', 'High in fiber', 'Provides sustained energy', 'Supports weight management'],
        howToUse: 'Add 1-2 tablespoons to water, smoothies, or food. Let soak for gel texture.',
        ingredients: ['100% Organic Salvia Hispanica Seeds']
    },
    {
        name: 'Moringa Powder',
        slug: 'moringa-powder',
        shortDescription: 'Miracle tree leaf powder for complete nutrition',
        description: 'Organic moringa leaf powder, known as the miracle tree. Packed with vitamins, minerals, and antioxidants.',
        price: 600, discountPrice: null, categorySlug: 'superfoods',
        images: ['/assets/images/products/moringa_powder.png'],
        isFeatured: true, isNew: false, isBestseller: false, inStock: true,
        benefits: ['Rich in antioxidants', 'Complete nutrition', 'Boosts energy', 'Anti-inflammatory'],
        howToUse: 'Add 1 teaspoon to smoothies, juice, or water daily.',
        ingredients: ['100% Organic Moringa Oleifera Leaf Powder']
    },
    {
        name: 'Protein Powder',
        slug: 'protein-powder',
        shortDescription: 'Multi-source plant protein blend',
        description: 'Premium plant-based protein powder blend with pea, rice, and hemp proteins. Complete amino acid profile for muscle building.',
        price: 1500, discountPrice: 1299, categorySlug: 'superfoods',
        images: ['/assets/images/products/protein_powder.png'],
        isFeatured: false, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Complete amino acids', 'Muscle building', 'Post-workout recovery', 'Vegan friendly'],
        howToUse: 'Mix 1 scoop with water or milk. Take after workout.',
        ingredients: ['Pea Protein', 'Rice Protein', 'Hemp Protein', 'Natural Flavoring']
    },

    // ========== Cosmetics ==========
    {
        name: 'Natural Medicated Shampoo',
        slug: 'natural-shampoo',
        shortDescription: 'Herbal shampoo for healthy scalp and hair',
        description: 'Chemical-free medicated shampoo with neem, tea tree, and other herbs. Treats dandruff and promotes healthy hair growth.',
        price: 450, discountPrice: null, categorySlug: 'cosmetics',
        images: ['/assets/images/products/natural_shampoo.png'],
        isFeatured: true, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Treats dandruff', 'Strengthens hair', 'Soothes scalp', 'Chemical-free'],
        howToUse: 'Apply to wet hair, massage, and rinse. Use 2-3 times per week.',
        ingredients: ['Neem Extract', 'Tea Tree Oil', 'Aloe Vera', 'Hibiscus']
    },
    {
        name: 'Natural Face Serum',
        slug: 'natural-face-serum',
        shortDescription: 'Anti-aging serum for youthful glowing skin',
        description: 'Potent face serum with rosehip oil and vitamin C. Reduces fine lines, brightens skin, and provides deep hydration.',
        price: 750, discountPrice: 649, categorySlug: 'cosmetics',
        images: ['/assets/images/products/natural_face_serum.png'],
        isFeatured: true, isNew: false, isBestseller: false, inStock: true,
        benefits: ['Reduces fine lines', 'Brightens skin', 'Deep hydration', 'Anti-aging'],
        howToUse: 'Apply 2-3 drops on clean face morning and night before moisturizer.',
        ingredients: ['Rosehip Oil', 'Vitamin C', 'Hyaluronic Acid', 'Vitamin E']
    },
    {
        name: 'Henna Powder',
        slug: 'henna-powder',
        shortDescription: 'Natural hair color and conditioner',
        description: 'Premium quality henna powder for natural hair coloring and conditioning. Covers grey hair without chemicals.',
        price: 300, discountPrice: null, categorySlug: 'cosmetics',
        images: ['/assets/images/products/henna_powder.png'],
        isFeatured: false, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Natural hair color', 'Conditions hair', 'Covers grey', 'Strengthens hair'],
        howToUse: 'Mix with water or tea to paste. Apply to hair for 1-2 hours, then rinse.',
        ingredients: ['100% Pure Lawsonia Inermis Powder']
    },

    // ========== Spices ==========
    {
        name: 'Turmeric Powder',
        slug: 'turmeric-powder',
        shortDescription: 'Golden spice with powerful healing properties',
        description: 'Premium organic turmeric powder with high curcumin content. The golden spice for cooking and health benefits.',
        price: 250, discountPrice: null, categorySlug: 'spices',
        images: ['/assets/images/products/turmeric_powder.png'],
        isFeatured: true, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Anti-inflammatory', 'Powerful antioxidant', 'Supports immunity', 'Aids digestion'],
        howToUse: 'Use in cooking or mix 1/4 tsp with warm milk (golden milk).',
        ingredients: ['100% Organic Curcuma Longa Powder']
    },
    {
        name: 'Cardamom',
        slug: 'cardamom',
        shortDescription: 'Queen of spices with aromatic fragrance',
        description: 'Premium green cardamom pods with intense, aromatic flavor. Perfect for desserts, chai, and biryanis.',
        price: 800, discountPrice: null, categorySlug: 'spices',
        images: ['/assets/images/products/cardamom.png'],
        isFeatured: true, isNew: false, isBestseller: false, inStock: true,
        benefits: ['Freshens breath', 'Aids digestion', 'Aromatic', 'Detoxifying'],
        howToUse: 'Crush pods and add to tea, desserts, or rice dishes.',
        ingredients: ['100% Green Elettaria Cardamomum Pods']
    },
    {
        name: 'Saffron',
        slug: 'saffron',
        shortDescription: "World's most precious spice for luxury dishes",
        description: "Premium Kashmiri saffron threads, the world's most expensive spice. Adds golden color and unique flavor to dishes.",
        price: 2500, discountPrice: null, categorySlug: 'spices',
        images: ['/assets/images/products/saffron.png'],
        isFeatured: true, isNew: false, isBestseller: false, inStock: true,
        benefits: ['Mood enhancer', 'Rich in antioxidants', 'Adds luxury', 'Natural colorant'],
        howToUse: 'Soak a few threads in warm milk or water. Add to rice, desserts, or tea.',
        ingredients: ['100% Pure Crocus Sativus Threads']
    },

    // ========== Spiritual Items ==========
    {
        name: 'Singing Bowl',
        slug: 'singing-bowl',
        shortDescription: 'Handcrafted Tibetan bowl for sound therapy',
        description: 'Handcrafted Tibetan singing bowl for meditation and sound healing. Produces calming harmonic tones.',
        price: 3500, discountPrice: 2999, categorySlug: 'spiritual-items',
        images: ['/assets/images/products/singing_bowl.png'],
        isFeatured: true, isNew: false, isBestseller: false, inStock: true,
        benefits: ['Sound therapy', 'Reduces stress', 'Chakra balancing', 'Meditation aid'],
        howToUse: 'Gently strike or rim with mallet to produce sound.',
        ingredients: ['Seven Metal Alloy (Traditional Tibetan Blend)']
    },
    {
        name: 'Incense Sticks',
        slug: 'incense-sticks',
        shortDescription: 'Hand-rolled natural incense for meditation',
        description: 'Hand-rolled natural incense sticks made with traditional herbs and resins. Perfect for meditation and spiritual practices.',
        price: 150, discountPrice: null, categorySlug: 'spiritual-items',
        images: ['/assets/images/products/incense_sticks.png'],
        isFeatured: true, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Calming aroma', 'Purifies space', 'Aids meditation', 'Natural ingredients'],
        howToUse: 'Light tip and blow out flame. Place in incense holder.',
        ingredients: ['Sandalwood', 'Herbs', 'Resins', 'Essential Oils']
    },
    {
        name: 'Prayer Beads',
        slug: 'prayer-beads',
        shortDescription: 'Rudraksha mala for meditation and prayer',
        description: 'Traditional Rudraksha prayer beads (mala) with 108 beads. Perfect for japa meditation and spiritual practice.',
        price: 1200, discountPrice: null, categorySlug: 'spiritual-items',
        images: ['/assets/images/products/prayer_beads.png'],
        isFeatured: false, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Meditation focus', 'Spiritual connection', 'Stress relief', 'Traditional practice'],
        howToUse: 'Hold in right hand, use thumb to move through beads during mantra.',
        ingredients: ['108 Rudraksha Beads', 'Cotton Thread']
    },

    // ========== Sara Nursery ==========
    {
        name: 'Aloe Vera Plant',
        slug: 'aloe-vera-plant',
        shortDescription: 'Healing succulent for home and skin care',
        description: 'Live Aloe Vera plant in decorative pot. Known for its healing gel used for burns, skin care, and home remedies.',
        price: 400, discountPrice: null, categorySlug: 'nursery',
        images: ['/assets/images/products/aloe_vera_plant.png'],
        isFeatured: true, isNew: false, isBestseller: true, inStock: true,
        benefits: ['Medicinal gel', 'Air purifying', 'Easy care', 'Decorative'],
        howToUse: 'Place in bright indirect light. Water when soil is completely dry.',
        ingredients: ['Live Aloe Barbadensis Miller Plant', 'Decorative Pot', 'Potting Mix']
    },
    {
        name: 'Tulsi Plant',
        slug: 'tulsi-plant',
        shortDescription: 'Sacred basil for tea and spiritual practice',
        description: 'Live Holy Basil (Tulsi) plant in decorative pot. Sacred plant known for medicinal tea and spiritual significance.',
        price: 250, discountPrice: null, categorySlug: 'nursery',
        images: ['/assets/images/products/tulsi_plant.png'],
        isFeatured: true, isNew: false, isBestseller: false, inStock: true,
        benefits: ['Medicinal tea', 'Sacred plant', 'Air purifying', 'Insect repellent'],
        howToUse: 'Place in full sun. Water regularly. Harvest leaves for tea.',
        ingredients: ['Live Ocimum Tenuiflorum Plant', 'Terracotta Pot', 'Organic Soil']
    },
    {
        name: 'Peace Lily',
        slug: 'peace-lily',
        shortDescription: 'Elegant flower for low-light spaces',
        description: 'Live Peace Lily in elegant pot. Beautiful flowering plant that thrives in low light and purifies air.',
        price: 550, discountPrice: null, categorySlug: 'nursery',
        images: ['/assets/images/products/peace_lily.png'],
        isFeatured: true, isNew: false, isBestseller: false, inStock: true,
        benefits: ['Beautiful flowers', 'Thrives in low light', 'Air purifying', 'Elegant appearance'],
        howToUse: 'Place in low to medium indirect light. Keep soil moist but not soggy.',
        ingredients: ['Live Spathiphyllum Plant', 'Elegant White Pot', 'Premium Potting Mix']
    }
];
