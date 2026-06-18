import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { createReactiveStore } from '@/utils/reactiveStore'
import { generateId } from '@/utils/format'

const defaultTags = ['UI设计', 'UX研究', '品牌视觉', '插画', '动效', '其他']

const mockWorks = [
  {
    id: '1',
    title: '电商APP产品设计',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20ecommerce%20mobile%20app%20ui%20design%20minimal&image_size=square_hd',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20ecommerce%20mobile%20app%20ui%20design%20minimal%20clean&image_size=portrait_4_3',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ecommerce%20product%20list%20page%20ui%20design&image_size=portrait_4_3',
    ],
    description: '这是一个完整的电商移动端产品设计项目，包含商品浏览、购物车、结算等全流程体验设计。整体风格采用简约现代的设计语言，注重用户体验和交互流畅度。',
    tags: ['UI设计', 'UX研究'],
    year: 2024,
    projectUrl: 'https://example.com/project1',
    isPublic: true,
    createdAt: '2024-10-15T10:30:00',
    updatedAt: '2024-10-15T10:30:00',
  },
  {
    id: '2',
    title: '品牌视觉设计项目',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20brand%20identity%20logo%20design%20minimal&image_size=square_hd',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=brand%20identity%20system%20logo%20mockup&image_size=landscape_4_3',
    ],
    description: '为科技初创公司打造完整的品牌视觉识别系统，包含logo设计、色彩规范、应用场景等设计输出。',
    tags: ['品牌视觉'],
    year: 2024,
    projectUrl: '',
    isPublic: true,
    createdAt: '2024-09-20T14:20:00',
    updatedAt: '2024-09-20T14:20:00',
  },
  {
    id: '3',
    title: '抽象插画集创作',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20digital%20illustration%20colorful%20geometric&image_size=square_hd',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20digital%20illustration%20colorful%20geometric%20art&image_size=landscape_16_9',
    ],
    description: '一系列抽象风格的数字插画创作，探索色彩和形状的表现力，用作个人艺术探索和作品集展示。',
    tags: ['插画'],
    year: 2023,
    projectUrl: '',
    isPublic: true,
    createdAt: '2023-12-05T09:15:00',
    updatedAt: '2023-12-05T09:15:00',
  },
  {
    id: '4',
    title: '金融科技平台设计',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fintech%20platform%20dashboard%20ui%20design%20modern&image_size=square_hd',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=financial%20dashboard%20analytics%20ui&image_size=landscape_16_9',
    ],
    description: '为金融科技公司设计的一站式管理平台，包含数据分析、交易管理、用户管理等核心功能模块。',
    tags: ['UI设计', 'UX研究'],
    year: 2024,
    projectUrl: '',
    isPublic: true,
    createdAt: '2024-08-10T11:00:00',
    updatedAt: '2024-08-10T11:00:00',
  },
  {
    id: '5',
    title: '健康管理APP设计',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=health%20fitness%20app%20ui%20design%20clean%20modern&image_size=square_hd',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=health%20tracking%20app%20interface&image_size=portrait_4_3',
    ],
    description: '个人健康管理移动端应用，支持运动记录、饮食管理、睡眠监测等功能，采用温暖亲切的设计风格。',
    tags: ['UI设计'],
    year: 2024,
    projectUrl: '',
    isPublic: true,
    createdAt: '2024-07-15T16:30:00',
    updatedAt: '2024-07-15T16:30:00',
  },
  {
    id: '6',
    title: '动画表情设计',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20animated%20emoji%20character%20design%20colorful&image_size=square_hd',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=emoji%20character%20set%20design%20kawaii&image_size=landscape_4_3',
    ],
    description: '为社交平台设计的一套动态表情贴纸，包含20+个角色表情，支持GIF动效输出。',
    tags: ['动效', '插画'],
    year: 2023,
    projectUrl: '',
    isPublic: true,
    createdAt: '2023-11-20T10:00:00',
    updatedAt: '2023-11-20T10:00:00',
  },
  {
    id: '7',
    title: '企业官网重设计',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=corporate%20website%20design%20modern%20professional&image_size=square_hd',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=business%20website%20homepage%20design&image_size=landscape_16_9',
    ],
    description: '传统制造业企业官网的现代化改造项目，提升品牌形象和用户体验。',
    tags: ['品牌视觉', 'UI设计'],
    year: 2024,
    projectUrl: '',
    isPublic: true,
    createdAt: '2024-06-05T09:30:00',
    updatedAt: '2024-06-05T09:30:00',
  },
  {
    id: '8',
    title: '教育平台设计',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=education%20platform%20learning%20app%20ui%20design&image_size=square_hd',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=online%20learning%20platform%20dashboard&image_size=landscape_16_9',
    ],
    description: '在线教育学习平台，支持课程管理、学习进度追踪、社区互动等功能。',
    tags: ['UI设计', 'UX研究'],
    year: 2024,
    projectUrl: '',
    isPublic: true,
    createdAt: '2024-05-20T14:00:00',
    updatedAt: '2024-05-20T14:00:00',
  },
  {
    id: '9',
    title: '餐饮外卖APP设计',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=food%20delivery%20app%20ui%20design%20colorful%20modern&image_size=square_hd',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=food%20ordering%20app%20interface&image_size=portrait_4_3',
    ],
    description: '餐饮外卖平台移动端应用，支持餐厅浏览、菜品搜索、订单管理等核心功能。',
    tags: ['UI设计'],
    year: 2023,
    projectUrl: '',
    isPublic: true,
    createdAt: '2023-10-10T11:30:00',
    updatedAt: '2023-10-10T11:30:00',
  },
  {
    id: '10',
    title: '音乐播放器设计',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=music%20player%20app%20ui%20design%20dark%20theme&image_size=square_hd',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=music%20player%20interface%20dark%20mode&image_size=portrait_4_3',
    ],
    description: '音乐流媒体播放器应用设计，支持深色模式，注重视觉沉浸感和交互体验。',
    tags: ['UI设计', '动效'],
    year: 2023,
    projectUrl: '',
    isPublic: true,
    createdAt: '2023-09-05T15:45:00',
    updatedAt: '2023-09-05T15:45:00',
  },
]

const useWorksStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        works: mockWorks,
        customTags: [...defaultTags],

        addWork: (work) => {
          const now = new Date().toISOString()
          const newWork = { ...work, id: generateId(), createdAt: now, updatedAt: now }
          set((state) => ({ works: [newWork, ...state.works] }))
        },

        updateWork: (id, data) => {
          set((state) => ({
            works: state.works.map((work) =>
              work.id === id ? { ...work, ...data, updatedAt: new Date().toISOString() } : work
            ),
          }))
        },

        deleteWork: (id) => {
          set((state) => ({ works: state.works.filter((work) => work.id !== id) }))
        },

        getWorkById: (id) => {
          return get().works.find((work) => work.id === id)
        },

        addCustomTag: (tag) => {
          if (!get().customTags.includes(tag)) {
            set((state) => ({ customTags: [...state.customTags, tag] }))
          }
        },

        getAllTags: () => get().customTags,

        getPublicWorks: () => get().works.filter((work) => work.isPublic),
      }),
      { name: 'works-storage' }
    )
  )
)

export default createReactiveStore(useWorksStore)