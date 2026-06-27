import type { SeedClient } from "./client";
import {
	coverImg,
	giftImg,
	makeCategory,
	makeGift,
	makePurchase,
	makeWishlist,
} from "./factories";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function upsertWishlist(
	db: SeedClient,
	ownerId: number,
	data: ReturnType<typeof makeWishlist>,
) {
	return db.wishlist.upsert({
		where: { slug: data.slug as string },
		create: { ownerId, ...data },
		update: {},
	});
}

async function hasGifts(db: SeedClient, wishlistId: string) {
	const count = await db.gift.count({ where: { wishlistId } });
	return count > 0;
}

// ── Wishlist 1: Cumpleaños ────────────────────────────────────────────────────

export async function seedBirthdayWishlist(db: SeedClient, ownerId: number) {
	const wishlist = await upsertWishlist(
		db,
		ownerId,
		makeWishlist({
			title: "Cumpleaños de Paula",
			slug: "cumpleanos-de-paula-2026",
			eventType: "birthday",
			currency: "PEN",
			heroTitle: "¡Celebra conmigo mi cumpleaños! 🎂",
			welcomeMessage:
				"Gracias por querer hacerme este día especial. Cada regalo, grande o pequeño, significa mucho para mí.",
			thankYouMessage:
				"¡Muchísimas gracias por tu regalo! Me hace muy feliz contar contigo en mi cumpleaños.",
			displayName: "Paula Díaz",
			eventDate: new Date("2026-08-15"),
			coverImageUrl: coverImg("birthday-flowers"),
			publishedAt: new Date(),
		}),
	);

	if (await hasGifts(db, wishlist.id)) {
		console.log(
			`  ↩  Wishlist "${wishlist.title}" already has gifts — skipped`,
		);
		return wishlist;
	}

	// Categories
	const [catTech, catHome, catWellness] = await Promise.all([
		db.category.create({
			data: {
				wishlistId: wishlist.id,
				...makeCategory({ name: "Tecnología", sortOrder: 0 }),
			},
		}),
		db.category.create({
			data: {
				wishlistId: wishlist.id,
				...makeCategory({ name: "Hogar y Cocina", sortOrder: 1 }),
			},
		}),
		db.category.create({
			data: {
				wishlistId: wishlist.id,
				...makeCategory({ name: "Bienestar", sortOrder: 2 }),
			},
		}),
	]);

	// Gifts
	const [, , , , , taza, , setcuchillos] = await Promise.all([
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				categoryId: catTech.id,
				...makeGift({
					name: "iPhone 16 Pro",
					storeName: "Apple Store",
					imageUrl: giftImg("iphone-16-pro"),
					productUrl: "https://www.apple.com/shop/buy-iphone",
					priceAmount: 1200,
					priceCurrency: "PEN",
					priority: "high",
					sortOrder: 0,
					publicNote: "El negro sideral, 256 GB.",
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				categoryId: catTech.id,
				...makeGift({
					name: "AirPods Pro 2da Gen",
					storeName: "Apple Store",
					imageUrl: giftImg("airpods-pro"),
					priceAmount: 350,
					priceCurrency: "PEN",
					priority: "high",
					sortOrder: 1,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				categoryId: catHome.id,
				...makeGift({
					name: "KitchenAid Artisan Stand Mixer",
					storeName: "KitchenAid",
					imageUrl: giftImg("kitchenaid-mixer"),
					priceAmount: 850,
					priceCurrency: "PEN",
					priority: "high",
					sortOrder: 2,
					publicNote: "Color rojo empire o empire red.",
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				categoryId: catHome.id,
				...makeGift({
					name: "Set de cuchillos Wüsthof",
					storeName: "Wüsthof",
					imageUrl: giftImg("knife-set-kitchen"),
					priceAmount: 95,
					priceCurrency: "PEN",
					priority: "medium",
					quantityNeeded: 2,
					sortOrder: 3,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				categoryId: catWellness.id,
				...makeGift({
					name: "Yoga Mat Premium Manduka",
					storeName: "Manduka",
					imageUrl: giftImg("yoga-mat-purple"),
					priceAmount: 120,
					priceCurrency: "PEN",
					priority: "medium",
					sortOrder: 4,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				...makeGift({
					name: "Taza personalizada",
					imageUrl: giftImg("ceramic-mug"),
					priceAmount: 25,
					priceCurrency: "PEN",
					priority: "low",
					sortOrder: 5,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				...makeGift({
					name: "Perfume CH Carolina Herrera",
					storeName: "Carolina Herrera",
					imageUrl: giftImg("perfume-bottle"),
					priceAmount: 180,
					priceCurrency: "PEN",
					priority: "medium",
					sortOrder: 6,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				categoryId: catWellness.id,
				...makeGift({
					name: "Camiseta Nike Dri-FIT",
					storeName: "Nike",
					imageUrl: giftImg("nike-shirt"),
					priceAmount: 80,
					priceCurrency: "PEN",
					priority: "low",
					sortOrder: 7,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				...makeGift({
					name: "Netflix Gift Card (3 meses)",
					priceAmount: 90,
					priceCurrency: "PEN",
					priority: "low",
					visibilityStatus: "hidden",
					sortOrder: 8,
					internalNote: "Para regalarme de parte del grupo si quieren.",
				}),
			},
		}),
	]);

	// Mark "Taza personalizada" as fully purchased
	await db.purchase.create({
		data: {
			giftId: taza.id,
			...makePurchase({ guestName: "María García", quantity: 1 }),
		},
	});

	// Partially purchase "Set de cuchillos" (needs 2, purchase 1 → still "available")
	await db.purchase.create({
		data: {
			giftId: setcuchillos.id,
			...makePurchase({ guestName: "Carlos López", quantity: 1 }),
		},
	});

	console.log(`  ✓  Seeded "${wishlist.title}" with 9 gifts`);
	return wishlist;
}

// ── Wishlist 2: Baby Shower ───────────────────────────────────────────────────

export async function seedBabyShowerWishlist(db: SeedClient, ownerId: number) {
	const wishlist = await upsertWishlist(
		db,
		ownerId,
		makeWishlist({
			title: "Baby Shower de Ana",
			slug: "baby-shower-de-ana-2026",
			eventType: "baby_shower",
			currency: "USD",
			heroTitle: "¡Bienvenido al mundo, pequeño! 👶",
			welcomeMessage:
				"Estamos emocionados de compartir este momento especial con ustedes. ¡Gracias por acompañarnos!",
			thankYouMessage:
				"¡Gracias de corazón por tu regalo para nuestro bebé! Cada detalle cuenta.",
			displayName: "Ana Ramírez",
			eventDate: new Date("2026-09-20"),
			coverImageUrl: coverImg("baby-nursery-soft"),
			publishedAt: new Date(),
		}),
	);

	if (await hasGifts(db, wishlist.id)) {
		console.log(
			`  ↩  Wishlist "${wishlist.title}" already has gifts — skipped`,
		);
		return wishlist;
	}

	// Gifts (flat list, no categories)
	const [, monitorBebe, , , mochila] = await Promise.all([
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				...makeGift({
					name: "Coche de bebé Bugaboo Fox 5",
					storeName: "Bugaboo",
					imageUrl: giftImg("baby-stroller-white"),
					priceAmount: 800,
					priceCurrency: "USD",
					priority: "high",
					sortOrder: 0,
					publicNote: "Color midnight black o forest green.",
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				...makeGift({
					name: "Monitor de bebé Owlet Dream Duo",
					storeName: "Owlet",
					imageUrl: giftImg("baby-monitor"),
					priceAmount: 250,
					priceCurrency: "USD",
					priority: "medium",
					sortOrder: 1,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				...makeGift({
					name: "Silla para auto Maxi-Cosi Pria",
					storeName: "Maxi-Cosi",
					imageUrl: giftImg("car-seat-baby"),
					priceAmount: 300,
					priceCurrency: "USD",
					priority: "high",
					sortOrder: 2,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				...makeGift({
					name: "Cuna de madera convertible",
					storeName: "IKEA",
					imageUrl: giftImg("baby-crib-wood"),
					priceAmount: 450,
					priceCurrency: "USD",
					priority: "high",
					sortOrder: 3,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				...makeGift({
					name: "Mochila de maternidad Dagne Dover",
					storeName: "Dagne Dover",
					imageUrl: giftImg("diaper-bag-backpack"),
					priceAmount: 120,
					priceCurrency: "USD",
					priority: "medium",
					sortOrder: 4,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				...makeGift({
					name: "Ropa de recién nacido (set 5 pcs)",
					storeName: "Carter's",
					imageUrl: giftImg("baby-clothes-set"),
					priceAmount: 80,
					priceCurrency: "USD",
					priority: "medium",
					quantityNeeded: 3,
					sortOrder: 5,
					publicNote: "Talla 0-3 meses y 3-6 meses.",
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				...makeGift({
					name: "Bañera portátil Skip Hop",
					storeName: "Skip Hop",
					imageUrl: giftImg("baby-bathtub"),
					priceAmount: 60,
					priceCurrency: "USD",
					priority: "medium",
					sortOrder: 6,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				...makeGift({
					name: "Pañales Pampers (pack x 80)",
					storeName: "Pampers",
					imageUrl: giftImg("diapers-pack"),
					priceAmount: 30,
					priceCurrency: "USD",
					priority: "low",
					quantityNeeded: 5,
					sortOrder: 7,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				...makeGift({
					name: "Juego de sábanas de cuna",
					storeName: "Pottery Barn Kids",
					imageUrl: giftImg("crib-sheets-set"),
					priceAmount: 90,
					priceCurrency: "USD",
					priority: "medium",
					sortOrder: 8,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				...makeGift({
					name: "Chupetes Philips Avent (pack x 3)",
					storeName: "Philips",
					imageUrl: giftImg("baby-pacifier"),
					priceAmount: 15,
					priceCurrency: "USD",
					priority: "low",
					visibilityStatus: "hidden",
					sortOrder: 9,
				}),
			},
		}),
	]);

	// Monitor de bebé → fully purchased
	await db.purchase.create({
		data: {
			giftId: monitorBebe.id,
			...makePurchase({
				guestName: "Familia Rodríguez",
				quantity: 1,
				message: "¡Felicidades! Con mucho cariño.",
			}),
		},
	});

	// Mochila → fully purchased
	await db.purchase.create({
		data: {
			giftId: mochila.id,
			...makePurchase({ guestName: "Laura Méndez", quantity: 1 }),
		},
	});

	console.log(`  ✓  Seeded "${wishlist.title}" with 10 gifts`);
	return wishlist;
}

// ── Wishlist 3: Boda (draft) ──────────────────────────────────────────────────

export async function seedWeddingWishlist(db: SeedClient, ownerId: number) {
	const wishlist = await upsertWishlist(
		db,
		ownerId,
		makeWishlist({
			title: "Nuestra Boda 2026",
			slug: "boda-2026",
			eventType: "wedding",
			currency: "PEN",
			heroTitle: "¡Nos casamos! 💍",
			welcomeMessage:
				"Queremos celebrar este día especial rodeados de las personas que más queremos.",
			displayName: "Paula & Rodrigo",
			eventDate: new Date("2026-12-12"),
			coverImageUrl: coverImg("wedding-flowers-arch"),
			status: "draft",
		}),
	);

	if (await hasGifts(db, wishlist.id)) {
		console.log(
			`  ↩  Wishlist "${wishlist.title}" already has gifts — skipped`,
		);
		return wishlist;
	}

	// Categories
	const [catCocina, catHogar] = await Promise.all([
		db.category.create({
			data: {
				wishlistId: wishlist.id,
				...makeCategory({ name: "Cocina", sortOrder: 0 }),
			},
		}),
		db.category.create({
			data: {
				wishlistId: wishlist.id,
				...makeCategory({ name: "Hogar", sortOrder: 1 }),
			},
		}),
	]);

	// Gifts
	await Promise.all([
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				categoryId: catCocina.id,
				...makeGift({
					name: "Robot de cocina Thermomix TM7",
					storeName: "Thermomix",
					imageUrl: giftImg("thermomix-robot"),
					priceAmount: 2500,
					priceCurrency: "PEN",
					priority: "high",
					sortOrder: 0,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				categoryId: catCocina.id,
				...makeGift({
					name: "Cafetera Nespresso Creatista Plus",
					storeName: "Nespresso",
					imageUrl: giftImg("nespresso-machine"),
					priceAmount: 700,
					priceCurrency: "PEN",
					priority: "high",
					sortOrder: 1,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				categoryId: catCocina.id,
				...makeGift({
					name: "Set de vajilla Wedgwood (12 piezas)",
					storeName: "Wedgwood",
					imageUrl: giftImg("dinnerware-set"),
					priceAmount: 500,
					priceCurrency: "PEN",
					priority: "high",
					quantityNeeded: 2,
					sortOrder: 2,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				categoryId: catHogar.id,
				...makeGift({
					name: "Set de toallas Egyptian Cotton",
					storeName: "Christy",
					imageUrl: giftImg("towel-set-luxury"),
					priceAmount: 150,
					priceCurrency: "PEN",
					priority: "medium",
					sortOrder: 3,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				categoryId: catHogar.id,
				...makeGift({
					name: "Cuadros para el hogar (set x 3)",
					imageUrl: giftImg("wall-art-abstract"),
					priceAmount: 200,
					priceCurrency: "PEN",
					priority: "low",
					sortOrder: 4,
				}),
			},
		}),
		db.gift.create({
			data: {
				wishlistId: wishlist.id,
				...makeGift({
					name: "Aporte para luna de miel en Japón",
					priceAmount: 3000,
					priceCurrency: "PEN",
					priority: "high",
					sortOrder: 5,
					publicNote:
						"¡Nuestro sueño es ir a Japón en primavera! Cualquier aporte suma.",
					visibilityStatus: "hidden",
				}),
			},
		}),
	]);

	console.log(`  ✓  Seeded "${wishlist.title}" with 6 gifts (draft)`);
	return wishlist;
}
