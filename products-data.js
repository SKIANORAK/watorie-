// products-data.js - ТОЛЬКО ДАННЫЕ ТОВАРОВ
const products = [
    {
        id: 1,
        name: "W-JEANS",
        price: 3500,
        images: [
            "jeans1.jpg",
            "jeans3.jpg",
            "t-shirts3.jpg",
            "wjeans6.jpg",
            "wjeans7.jpg"
        ],
        videos: [
            {
                src: "videoww.mp4",
                caption: "W-JEANS"
            },
            {
                src: "videos/hoodie-video2.mp4", 
                caption: "Детали и качество пошива"
            }
        ],
        description: " джинсы со световозвращающей тканью, покажи людям свет",
        characteristics: "кастомные джинсы, со светоотражающими заплатками",
        features: ["100% хлопок", "Усиленные швы", "Свободный крой"]
    },
    {
        id: 2, 
        name: "W-SHIRT", 
        price: 1500,
        images: [
            "W-shirt.jpg",
            "W-shirt2.jpg",
            "W-shirt3.jpg"
        ],
        videos: [
            {
                src: "wvideo.mp4",
                caption: " обзор"
            }
        ],
        description: "футболка в стиле distressed.",
        characteristics: "расшитая футболка с порезами",
        features: ["100% трикотаж", "Прямой крой"]
    },
    {
        id: 3,
        name: "CUSTOM",
        price: "договорная",
        images: [
            "shvei.jpg"
        ],
        description: "любой договорный кастом",
        characteristics: "",
        features: ["Хлопок , полиэстер ", " трикотаж"]
    }
];








