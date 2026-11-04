import type { PublicVehicle } from './public';
export const demoEnabled = process.env.DEMO_INVENTORY === 'true';
export const demoVehicles:PublicVehicle[] = [
  {
    "id": 900001,
    "vin": "DEMO0000000000001",
    "make": "Toyota",
    "model": "Camry",
    "year": 2010,
    "mileage": 18000,
    "asking_price": "7995.00",
    "description": "A midsize sedan with a spacious cabin for daily commuting and longer journeys.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 1,
        "vehicle_id": 900001,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/2010_Toyota_Camry_LE_--_11-25-2009.jpg/960px-2010_Toyota_Camry_LE_--_11-25-2009.jpg"
      }
    ]
  },
  {
    "id": 900002,
    "vin": "DEMO0000000000002",
    "make": "Toyota",
    "model": "Camry",
    "year": 2009,
    "mileage": 24250,
    "asking_price": "7495.00",
    "description": "A midsize sedan with a spacious cabin for daily commuting and longer journeys.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 2,
        "vehicle_id": 900002,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/2009_V6_Toyota_Camry.jpg/960px-2009_V6_Toyota_Camry.jpg"
      }
    ]
  },
  {
    "id": 900003,
    "vin": "DEMO0000000000003",
    "make": "Honda",
    "model": "Accord",
    "year": 2023,
    "mileage": 30500,
    "asking_price": "25995.00",
    "description": "A midsize sedan with a balanced design and room for everyday driving.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 3,
        "vehicle_id": 900003,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/2023_Honda_Accord_front_view.jpg/960px-2023_Honda_Accord_front_view.jpg"
      }
    ]
  },
  {
    "id": 900004,
    "vin": "DEMO0000000000004",
    "make": "Honda",
    "model": "Accord",
    "year": 2008,
    "mileage": 36750,
    "asking_price": "6995.00",
    "description": "A midsize sedan with a balanced design and room for everyday driving.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 4,
        "vehicle_id": 900004,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Honda_Accord_front_%282008%29.jpg/960px-Honda_Accord_front_%282008%29.jpg"
      }
    ]
  },
  {
    "id": 900005,
    "vin": "DEMO0000000000005",
    "make": "Honda",
    "model": "Civic",
    "year": 1989,
    "mileage": 43000,
    "asking_price": "5995.00",
    "description": "A compact Honda with a smaller footprint for city streets and daily travel.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 5,
        "vehicle_id": 900005,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Honda_Civic_Front.jpg/960px-Honda_Civic_Front.jpg"
      }
    ]
  },
  {
    "id": 900006,
    "vin": "DEMO0000000000006",
    "make": "Honda",
    "model": "Civic",
    "year": 2011,
    "mileage": 49250,
    "asking_price": "8495.00",
    "description": "A compact Honda with a smaller footprint for city streets and daily travel.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 6,
        "vehicle_id": 900006,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Honda_Civic_%28front%29.jpg/960px-Honda_Civic_%28front%29.jpg"
      }
    ]
  },
  {
    "id": 900007,
    "vin": "DEMO0000000000007",
    "make": "Honda",
    "model": "Civic",
    "year": 2006,
    "mileage": 55500,
    "asking_price": "6495.00",
    "description": "A compact Honda with a smaller footprint for city streets and daily travel.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 7,
        "vehicle_id": 900007,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Honda_Civic_-_Front_View.jpg/960px-Honda_Civic_-_Front_View.jpg"
      }
    ]
  },
  {
    "id": 900008,
    "vin": "DEMO0000000000008",
    "make": "Toyota",
    "model": "Corolla",
    "year": 1976,
    "mileage": 61750,
    "asking_price": "12995.00",
    "description": "A classic compact Toyota with a simple, timeless design.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 8,
        "vehicle_id": 900008,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/ToyotaCorolla-front.jpg/960px-ToyotaCorolla-front.jpg"
      }
    ]
  },
  {
    "id": 900009,
    "vin": "DEMO0000000000009",
    "make": "Toyota",
    "model": "RAV4",
    "year": 2002,
    "mileage": 68000,
    "asking_price": "5495.00",
    "description": "A compact SUV with a practical body style and room for everyday errands.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 9,
        "vehicle_id": 900009,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Toyota_RAV4_front_20080112.jpg/960px-Toyota_RAV4_front_20080112.jpg"
      }
    ]
  },
  {
    "id": 900010,
    "vin": "DEMO0000000000010",
    "make": "Toyota",
    "model": "RAV4",
    "year": 1998,
    "mileage": 74250,
    "asking_price": "4995.00",
    "description": "A compact SUV with a practical body style and room for everyday errands.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 10,
        "vehicle_id": 900010,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Toyota_RAV4_front_20080807.jpg/960px-Toyota_RAV4_front_20080807.jpg"
      }
    ]
  },
  {
    "id": 900011,
    "vin": "DEMO0000000000011",
    "make": "Toyota",
    "model": "RAV4",
    "year": 2007,
    "mileage": 80500,
    "asking_price": "7995.00",
    "description": "A compact SUV with a practical body style and room for everyday errands.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 11,
        "vehicle_id": 900011,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Toyota_RAV4_front_20080303.jpg/960px-Toyota_RAV4_front_20080303.jpg"
      }
    ]
  },
  {
    "id": 900012,
    "vin": "DEMO0000000000012",
    "make": "Honda",
    "model": "CR-V",
    "year": 2020,
    "mileage": 86750,
    "asking_price": "21995.00",
    "description": "A versatile compact SUV designed around passenger and cargo space.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 12,
        "vehicle_id": 900012,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/2017-2022_Honda_CR-V_Facelift_%28Front%29.jpg/960px-2017-2022_Honda_CR-V_Facelift_%28Front%29.jpg"
      }
    ]
  },
  {
    "id": 900013,
    "vin": "DEMO0000000000013",
    "make": "Honda",
    "model": "CR-V",
    "year": 2017,
    "mileage": 93000,
    "asking_price": "17995.00",
    "description": "A versatile compact SUV designed around passenger and cargo space.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 13,
        "vehicle_id": 900013,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/2017_Honda_CR-V_front_4.11.18.jpg/960px-2017_Honda_CR-V_front_4.11.18.jpg"
      }
    ]
  },
  {
    "id": 900014,
    "vin": "DEMO0000000000014",
    "make": "Subaru",
    "model": "Outback",
    "year": 2007,
    "mileage": 99250,
    "asking_price": "6995.00",
    "description": "A wagon-style crossover with a practical cabin and road-trip appeal.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 14,
        "vehicle_id": 900014,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Subaru_Outback_front_20080202.jpg/960px-Subaru_Outback_front_20080202.jpg"
      }
    ]
  },
  {
    "id": 900015,
    "vin": "DEMO0000000000015",
    "make": "Mazda",
    "model": "CX-5",
    "year": 2012,
    "mileage": 105500,
    "asking_price": "9995.00",
    "description": "A compact crossover with clean styling and a driver-focused layout.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 15,
        "vehicle_id": 900015,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Mazda_CX-5_%28front%29.jpg/960px-Mazda_CX-5_%28front%29.jpg"
      }
    ]
  },
  {
    "id": 900016,
    "vin": "DEMO0000000000016",
    "make": "Kia",
    "model": "Sportage",
    "year": 2011,
    "mileage": 111750,
    "asking_price": "8495.00",
    "description": "A compact SUV with flexible interior space for everyday use.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 16,
        "vehicle_id": 900016,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Kia_Sportage_III.JPG/960px-Kia_Sportage_III.JPG"
      }
    ]
  },
  {
    "id": 900017,
    "vin": "DEMO0000000000017",
    "make": "Ford",
    "model": "Mustang",
    "year": 2008,
    "mileage": 118000,
    "asking_price": "14995.00",
    "description": "A distinctive Ford coupe with a sporty profile and unmistakable styling.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 17,
        "vehicle_id": 900017,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Ford_Mustang_front_20080727.jpg/960px-Ford_Mustang_front_20080727.jpg"
      }
    ]
  },
  {
    "id": 900018,
    "vin": "DEMO0000000000018",
    "make": "Ford",
    "model": "Mustang",
    "year": 2015,
    "mileage": 124250,
    "asking_price": "20995.00",
    "description": "A distinctive Ford coupe with a sporty profile and unmistakable styling.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 18,
        "vehicle_id": 900018,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/2015_Ford_Mustang_Front_View.jpg/960px-2015_Ford_Mustang_Front_View.jpg"
      }
    ]
  },
  {
    "id": 900019,
    "vin": "DEMO0000000000019",
    "make": "Ford",
    "model": "Mustang",
    "year": 2019,
    "mileage": 130500,
    "asking_price": "29995.00",
    "description": "A distinctive Ford coupe with a sporty profile and unmistakable styling.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 19,
        "vehicle_id": 900019,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/2019_Ford_Mustang_5.0_Front.jpg/960px-2019_Ford_Mustang_5.0_Front.jpg"
      }
    ]
  },
  {
    "id": 900020,
    "vin": "DEMO0000000000020",
    "make": "Ford",
    "model": "F-150",
    "year": 2018,
    "mileage": 136750,
    "asking_price": "24995.00",
    "description": "A full-size pickup with a practical cargo bed and a commanding presence.\n\nDemo listing: price, mileage, year and condition are sample values. The photo matches the make and model; exact year, trim and equipment may differ. This vehicle is not actual LM Motors stock.",
    "images": [
      {
        "id": 20,
        "vehicle_id": 900020,
        "position": 0,
        "created_at": "2026-10-13T00:00:00Z",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/%2718_Ford_F-150.jpg/960px-%2718_Ford_F-150.jpg"
      }
    ]
  }
];
export const photoCredits = [
  {
    "vehicle": "2010 Toyota Camry",
    "author": "IFCAR",
    "license": "Public domain",
    "licenseUrl": "https://commons.wikimedia.org/wiki/File:2010_Toyota_Camry_LE_--_11-25-2009.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:2010_Toyota_Camry_LE_--_11-25-2009.jpg"
  },
  {
    "vehicle": "2009 Toyota Camry",
    "author": "James Benjamin Bleeker",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:2009_V6_Toyota_Camry.jpg"
  },
  {
    "vehicle": "2023 Honda Accord",
    "author": "deathpallie325",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "source": "https://commons.wikimedia.org/wiki/File:2023_Honda_Accord_front_view.jpg"
  },
  {
    "vehicle": "2008 Honda Accord",
    "author": "M 93",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Honda_Accord_front_%282008%29.jpg"
  },
  {
    "vehicle": "1989 Honda Civic",
    "author": "Toyyoda8",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Honda_Civic_Front.jpg"
  },
  {
    "vehicle": "2011 Honda Civic",
    "author": "Overlaet",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Honda_Civic_%28front%29.jpg"
  },
  {
    "vehicle": "2006 Honda Civic",
    "author": "(G)jabz",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Honda_Civic_-_Front_View.jpg"
  },
  {
    "vehicle": "1976 Toyota Corolla",
    "author": "dave_7",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/",
    "source": "https://commons.wikimedia.org/wiki/File:ToyotaCorolla-front.jpg"
  },
  {
    "vehicle": "2002 Toyota RAV4",
    "author": "Rudolf Stricker",
    "license": "Attribution",
    "licenseUrl": "https://commons.wikimedia.org/wiki/File:Toyota_RAV4_front_20080112.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Toyota_RAV4_front_20080112.jpg"
  },
  {
    "vehicle": "1998 Toyota RAV4",
    "author": "Rudolf Stricker",
    "license": "Attribution",
    "licenseUrl": "https://commons.wikimedia.org/wiki/File:Toyota_RAV4_front_20080807.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Toyota_RAV4_front_20080807.jpg"
  },
  {
    "vehicle": "2007 Toyota RAV4",
    "author": "Rudolf Stricker",
    "license": "Attribution",
    "licenseUrl": "https://commons.wikimedia.org/wiki/File:Toyota_RAV4_front_20080303.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Toyota_RAV4_front_20080303.jpg"
  },
  {
    "vehicle": "2020 Honda CR-V",
    "author": "Sebsoare2511",
    "license": "CC0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "source": "https://commons.wikimedia.org/wiki/File:2017-2022_Honda_CR-V_Facelift_%28Front%29.jpg"
  },
  {
    "vehicle": "2017 Honda CR-V",
    "author": "Kevauto",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "source": "https://commons.wikimedia.org/wiki/File:2017_Honda_CR-V_front_4.11.18.jpg"
  },
  {
    "vehicle": "2007 Subaru Outback",
    "author": "Rudolf Stricker",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Subaru_Outback_front_20080202.jpg"
  },
  {
    "vehicle": "2012 Mazda CX-5",
    "author": "Overlaet",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Mazda_CX-5_%28front%29.jpg"
  },
  {
    "vehicle": "2011 Kia Sportage",
    "author": "Thomas doerfer",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Kia_Sportage_III.JPG"
  },
  {
    "vehicle": "2008 Ford Mustang",
    "author": "Rudolf Stricker",
    "license": "Attribution",
    "licenseUrl": "https://commons.wikimedia.org/wiki/File:Ford_Mustang_front_20080727.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Ford_Mustang_front_20080727.jpg"
  },
  {
    "vehicle": "2015 Ford Mustang",
    "author": "A. Bailey",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
    "source": "https://commons.wikimedia.org/wiki/File:2015_Ford_Mustang_Front_View.jpg"
  },
  {
    "vehicle": "2019 Ford Mustang",
    "author": "Vauxford",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "source": "https://commons.wikimedia.org/wiki/File:2019_Ford_Mustang_5.0_Front.jpg"
  },
  {
    "vehicle": "2018 Ford F-150",
    "author": "Bull-Doser",
    "license": "Public domain",
    "licenseUrl": "https://commons.wikimedia.org/wiki/File:%2718_Ford_F-150.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:%2718_Ford_F-150.jpg"
  }
];
