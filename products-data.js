// products-data.js - ТОЛЬКО ДАННЫЕ ТОВАРОВ
const products = [
    {
        id: 1,
        name: "wjeans",
        price: 3500,
        images: [
            "jeans1.jpg",
            "jeans3.jpg",
            "jeans2.jpg"
        ],
        videos: [
            {
                src: "videos/hoodie-video1.mp4",
                caption: "BasedGod Hoodie в движении"
            },
            {
                src: "videos/hoodie-video2.mp4", 
                caption: "Детали и качество пошива"
            }
        ],
        description: "Черное худи премиального качества с уникальным принтом.",
        features: ["100% хлопок", "Усиленные швы", "Свободный крой"]
    },
    {
        id: 2, 
        name: "T-SHIRT", 
        price: 1500,
        images: [
            "T-shirt1.jpg",
            "T-shirt2.jpg",
            "T-shirt3.jpg"
        ],
        videos: [
            {
                src: "videos/tshirt-video1.mp4",
                caption: "Белая футболка - обзор"
            }
        ],
        description: "Белая футболка классического кроя.",
        features: ["100% хлопок", "Прямой крой"]
    },
    {
        id: 3,
        name: "CUSTOM",
        price: "договорная",
        images: [
            "orig.jpg"
        ],
        videos: [
            {
                src: "videos/crew-video1.mp4",
                caption: "Свитшот в повседневном стиле"
            }
        ],
        description: "Свитшот с круглой горловиной.",
        features: ["Хлопок 80%, полиэстер 20%", "Французский трикотаж"]
    }

];
