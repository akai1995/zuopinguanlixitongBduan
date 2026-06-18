import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { createReactiveStore } from '@/utils/reactiveStore'
import { generateId } from '@/utils/format'

const aiTools = ['Midjourney', 'DALL·E 3', 'Stable Diffusion', 'Leonardo', '其他']

const defaultTags = ['写实', '插画', '3D', '抽象', '科幻', '奇幻', '古风', '像素', '美食', '建筑', '动物', '其他']

const mockAiImages = [
  {
    id: '1',
    title: '未来城市景观',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20cyberpunk%20city%20neon%20lights%20rainy%20night&image_size=landscape_16_9',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%20neon%20city%20night%20reflection%20on%20wet%20streets%20holographic%20billboards%20drones&image_size=landscape_16_9',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20city%20skyline%20at%20dusk%20flying%20cars%20neon%20lights%20megastructures&image_size=landscape_16_9',
    ],
    aiTool: 'Midjourney',
    prompt: 'A futuristic cyberpunk city at night, neon lights reflecting on wet streets, tall skyscrapers with holographic advertisements, cinematic lighting, atmospheric, 8k, hyperdetailed --ar 16:9 --v 6.0 --stylize 750',
    negativePrompt: 'blurry, low quality, deformed architecture',
    parameters: '--ar 16:9, --v 6.0, --stylize 750',
    generateDate: '2024-10-10',
    tags: ['写实', '城市', '赛博朋克'],
    isPublic: true,
    createdAt: '2024-10-10T16:45:00',
    updatedAt: '2024-10-10T16:45:00',
  },
  {
    id: '2',
    title: '抽象山水插画',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20minimal%20ink%20wash%20chinese%20landscape%20painting%20mountains%20mist&image_size=landscape_16_9',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20ink%20painting%20mountains%20river%20fog%20minimalist%20art&image_size=landscape_16_9',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=asian%20watercolor%20landscape%20mountains%20pine%20trees%20misty%20atmosphere%20serene&image_size=landscape_16_9',
    ],
    aiTool: 'Midjourney',
    prompt: 'Abstract Chinese ink wash landscape, minimalist composition, misty mountains, negative space, subtle gray tones, zen aesthetic, traditional ink painting on rice paper --ar 16:9',
    negativePrompt: 'colorful, busy, detailed, photorealistic',
    parameters: '--ar 16:9, --style raw',
    generateDate: '2024-09-28',
    tags: ['插画', '抽象', '水墨'],
    isPublic: true,
    createdAt: '2024-09-28T11:30:00',
    updatedAt: '2024-09-28T11:30:00',
  },
  {
    id: '3',
    title: '3D产品渲染',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%203d%20product%20render%20modern%20headphones%20studio%20lighting%20soft%20shadows%20clean%20background&image_size=square_hd',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20wireless%20headphones%203d%20render%20silver%20metallic%20modern%20design%20product%20photography&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20audio%20headset%20floating%20on%20gradient%20background%20studio%20lighting%20elegant&image_size=square_hd',
    ],
    aiTool: 'Stable Diffusion',
    prompt: 'Minimalist 3D product render, premium wireless headphones, soft studio lighting, subtle shadows, clean white background, high detail, product photography, commercial advertising',
    negativePrompt: 'text, watermark, clutter, messy',
    parameters: 'CFG scale 7, 20 steps',
    generateDate: '2024-10-02',
    tags: ['3D', '写实', '产品'],
    isPublic: true,
    createdAt: '2024-10-02T08:20:00',
    updatedAt: '2024-10-02T08:20:00',
  },
  {
    id: '4',
    title: '奇幻森林',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=magical%20enchanted%20forest%20with%20bioluminescent%20plants%20mysterious%20atmosphere&image_size=landscape_16_9',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=magical%20enchanted%20forest%20with%20bioluminescent%20plants%20mysterious%20atmosphere%20fantasy&image_size=landscape_16_9',
    ],
    aiTool: 'DALL·E 3',
    prompt: 'Magical enchanted forest at twilight, bioluminescent flora, glowing mushrooms, ethereal mist, fantasy landscape, cinematic lighting, magical realism',
    negativePrompt: 'dark, scary, horror, dull, boring',
    parameters: '--ar 16:9',
    generateDate: '2024-09-20',
    tags: ['奇幻', '自然', '插画'],
    isPublic: true,
    createdAt: '2024-09-20T14:00:00',
    updatedAt: '2024-09-20T14:00:00',
  },
  {
    id: '5',
    title: '太空探索',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=space%20exploration%20astronaut%20walking%20on%20mars%20surface%20red%20planet%20stars&image_size=landscape_16_9',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=space%20exploration%20astronaut%20walking%20on%20mars%20surface%20red%20planet%20stars%20sci-fi&image_size=landscape_16_9',
    ],
    aiTool: 'Leonardo',
    prompt: 'Astronaut exploring Mars surface, red planet landscape, stars in dark space, sci-fi scene, realistic astronaut suit, dramatic lighting, cinematic',
    negativePrompt: 'cartoon, anime, drawing, sketch',
    parameters: 'style: cinematic, quality: ultra',
    generateDate: '2024-09-15',
    tags: ['科幻', '太空', '写实'],
    isPublic: true,
    createdAt: '2024-09-15T10:30:00',
    updatedAt: '2024-09-15T10:30:00',
  },
  {
    id: '6',
    title: '古风人物',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20style%20beautiful%20woman%20in%20traditional%20hanfu%20elegant&image_size=portrait_4_3',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20style%20beautiful%20woman%20in%20traditional%20hanfu%20elegant%20painting&image_size=portrait_4_3',
    ],
    aiTool: 'Midjourney',
    prompt: 'Beautiful Chinese woman in traditional Hanfu dress, ancient palace background, elegant pose, watercolor painting style, soft colors, classical beauty',
    negativePrompt: 'modern, casual, western clothing, photorealistic',
    parameters: '--ar 4:3, --style expressive',
    generateDate: '2024-09-10',
    tags: ['古风', '人物', '插画'],
    isPublic: true,
    createdAt: '2024-09-10T16:00:00',
    updatedAt: '2024-09-10T16:00:00',
  },
  {
    id: '7',
    title: '像素艺术场景',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20art%20retro%20game%20scene%208bit%20style%20colorful%20platformer&image_size=square',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20art%20retro%20game%20scene%208bit%20style%20colorful%20platformer%20level&image_size=square',
    ],
    aiTool: 'Stable Diffusion',
    prompt: 'Retro pixel art game scene, 8-bit style, colorful platformer level, nostalgic gaming aesthetic, pixel characters, vibrant colors',
    negativePrompt: 'modern, realistic, 3D, high resolution',
    parameters: 'pixel art style, 8-bit aesthetic',
    generateDate: '2024-08-28',
    tags: ['像素', '复古', '游戏'],
    isPublic: true,
    createdAt: '2024-08-28T09:15:00',
    updatedAt: '2024-08-28T09:15:00',
  },
  {
    id: '8',
    title: '美食摄影',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=food%20photography%20gourmet%20dish%20elegant%20plating%20professional%20lighting&image_size=square_hd',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=food%20photography%20gourmet%20dish%20elegant%20plating%20professional%20lighting%20restaurant&image_size=square_hd',
    ],
    aiTool: 'DALL·E 3',
    prompt: 'Professional food photography, gourmet dish on elegant plate, restaurant setting, warm lighting, appetizing, culinary art, high-end dining',
    negativePrompt: 'messy, unappetizing, low quality, blurry',
    parameters: '--ar 1:1',
    generateDate: '2024-08-20',
    tags: ['美食', '摄影', '写实'],
    isPublic: true,
    createdAt: '2024-08-20T12:30:00',
    updatedAt: '2024-08-20T12:30:00',
  },
  {
    id: '9',
    title: '建筑设计',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20architecture%20building%20design%20minimalist%20glass%20facade%20skyscraper&image_size=landscape_16_9',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20architecture%20building%20design%20minimalist%20glass%20facade%20skyscraper%20futuristic&image_size=landscape_16_9',
    ],
    aiTool: 'Midjourney',
    prompt: 'Modern minimalist architecture, glass skyscraper, futuristic building design, clean lines, contemporary design, architectural photography',
    negativePrompt: 'old, dirty, cluttered, traditional',
    parameters: '--ar 16:9, --v 6.0',
    generateDate: '2024-08-15',
    tags: ['建筑', '设计', '现代'],
    isPublic: true,
    createdAt: '2024-08-15T14:45:00',
    updatedAt: '2024-08-15T14:45:00',
  },
  {
    id: '10',
    title: '动物肖像',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20lion%20portrait%20majestic%20wildlife%20photography%20golden%20hour%20savanna&image_size=portrait_4_3',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20lion%20portrait%20majestic%20wildlife%20photography%20golden%20hour%20savanna%20africa&image_size=portrait_4_3',
    ],
    aiTool: 'Leonardo',
    prompt: 'Majestic lion portrait, wildlife photography, golden hour lighting, African savanna background, powerful animal, detailed fur texture',
    negativePrompt: 'cartoon, drawing, zoo, captive',
    parameters: 'style: photorealistic, quality: ultra',
    generateDate: '2024-08-10',
    tags: ['动物', '肖像', '写实'],
    isPublic: true,
    createdAt: '2024-08-10T17:20:00',
    updatedAt: '2024-08-10T17:20:00',
  },
]

const useAiImagesStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        aiImages: mockAiImages,
        predefinedTools: [...aiTools],
        customTags: [...defaultTags],

        addAiImage: (data) => {
          const now = new Date().toISOString()
          const newItem = { ...data, id: generateId(), createdAt: now, updatedAt: now }
          set((state) => ({ aiImages: [newItem, ...state.aiImages] }))
        },

        updateAiImage: (id, data) => {
          set((state) => ({
            aiImages: state.aiImages.map((item) =>
              item.id === id ? { ...item, ...data, updatedAt: new Date().toISOString() } : item
            ),
          }))
        },

        deleteAiImage: (id) => {
          set((state) => ({ aiImages: state.aiImages.filter((item) => item.id !== id) }))
        },

        getAiImageById: (id) => {
          return get().aiImages.find((item) => item.id === id)
        },

        addAiTool: (tool) => {
          if (!get().predefinedTools.includes(tool)) {
            set((state) => ({ predefinedTools: [...state.predefinedTools, tool] }))
          }
        },

        addCustomTag: (tag) => {
          if (!get().customTags.includes(tag)) {
            set((state) => ({ customTags: [...state.customTags, tag] }))
          }
        },

        getPublicAiImages: () => get().aiImages.filter((item) => item.isPublic),
      }),
      { name: 'ai-images-storage-v2' }
    )
  )
)

export default createReactiveStore(useAiImagesStore)