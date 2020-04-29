const posts = []
const products = []
const comments = []
const initialActivity = []

for (var i = 0; i < 100; i++) {
  const userId = Math.round(Math.random() * 10)

  posts.push({
    type: 'post',
    id: i,
    author: userId,
    title: 'Example post',
    slug: 'example-post-' + i,
    image: 'https://miro.medium.com/max/1200/1*mk1-6aYaf_Bes1E3Imhc0A.jpeg',
    description: 'This is an example description',
    tags: [
      {
        slug: 'software',
        label: 'SOFTWARE',
      },
      {
        slug: 'ai',
        label: 'AI',
      },
    ],
  })

  products.push({
    type: 'product',
    id: i,
    author: userId,
    title: 'Example product',
    slug: 'example-product-' + i,
    description: 'This is an example description',
  })

  initialActivity.push({
    author: userId,
    type: 'content_added',
    meta: {
      contentTitle: 'Example post', // This will not work with dynamic fields
      contentType: 'post',
      contentId: i,
    },
  })

  initialActivity.push({
    author: userId,
    type: 'content_added',
    meta: {
      contentTitle: 'Example product', // This will not work with dynamic fields
      contentType: 'product',
      contentId: i,
    },
  })

  for (var j = 0; j < 50; j++) {
    comments.push({
      type: 'comment',
      contentType: 'post',
      contentId: i,
      message: 'A demo comment',
      author: Math.round(Math.random() * 10),
      slug: 'test-comment-' + j,
    })

    initialActivity.push({
      author: userId,
      type: 'comment_added',
      meta: {
        commentId: j,
        contentId: i,
        contentType: 'post',
      },
    })
  }
}

const initialContent = [...posts, ...products, ...comments]

module.exports = (defaultOptions) => {
  const postContentType = {
    title: {
      en: 'Post',
      es: 'Artículo',
    },

    slug: 'post',

    slugGeneration: ['title', 'createdAt'],

    permissions: {
      read: ['public'],
      create: [defaultOptions.roles.admin, defaultOptions.roles.user],
      update: [defaultOptions.roles.admin, defaultOptions.roles.user],
      delete: [defaultOptions.roles.admin],
      admin: [defaultOptions.roles.admin],
      approval: [defaultOptions.roles.admin],
      report: [defaultOptions.roles.user],
    },

    publishing: {
      needsApproval: true,
      allowsDraft: true,
    },

    comments: {
      enabled: true,
      permissions: {
        read: ['public'],
        create: [defaultOptions.roles.user, defaultOptions.roles.admin],
        update: [defaultOptions.roles.user, defaultOptions.roles.admin],
        delete: [defaultOptions.roles.admin],
        admin: [defaultOptions.roles.admin],
      },
    },

    fields: [
      {
        name: 'title',
        type: 'text',
        label: 'Title',
        title: true,
        placeholder: 'Title',
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Description',
      },
      {
        name: 'image',
        type: 'img',
        label: 'Image',
        placeholder: 'Image',
      },
      {
        name: 'file',
        type: 'file',
        label: 'File',
        placeholder: 'File',
      },
      {
        name: 'tags',
        type: 'tags',
        label: 'Tags',
        placeholder: 'Tags',
      },
    ],
  }

  const productContentType = {
    title: {
      en: 'Product',
      es: 'Producto',
    },

    slug: 'product',

    slugGeneration: ['title', 'createdAt'],

    permissions: {
      read: ['public'],
      create: [defaultOptions.roles.admin, defaultOptions.roles.user],
      update: [defaultOptions.roles.admin, defaultOptions.roles.user],
      delete: [defaultOptions.roles.admin],
      admin: [defaultOptions.roles.admin],
      approval: [defaultOptions.roles.admin],
      report: [defaultOptions.roles.user],
    },

    publishing: {
      needsApproval: true,
      allowsDraft: true,
    },

    comments: {
      enabled: false,
      permissions: {
        read: ['public'],
        create: [defaultOptions.roles.user, defaultOptions.roles.admin],
        update: [defaultOptions.roles.admin, defaultOptions.roles.user],
        delete: [defaultOptions.roles.admin],
        admin: [defaultOptions.roles.admin],
      },
    },

    fields: [
      {
        name: 'title',
        type: 'text',
        label: 'Title',
        placeholder: 'Title',
        title: true,
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Description',
      },
      {
        name: 'image',
        type: 'img',
        label: 'Image',
        multiple: true,
        placeholder: 'Image',
      },
      {
        name: 'stocknumber',
        type: 'text',
        label: 'Stock Number',
        placeholder: 'SKU',
      },
      {
        name: 'price',
        type: 'number',
        label: 'Price',
        placeholder: 'Price',
      },
      {
        name: 'stockamount',
        type: 'number',
        label: 'Stock Amount',
        placeholder: 'Stock Amount',
      },
    ],
  }

  return {
    title: 'The Demo Site',
    description: 'A super NextJS demo site starter pro pack super sexy',
    domain: 'demosite.com',
    storage: {
      type: 'firestore',
    },
    database: {
      type: 'IN_MEMORY',
    },

    // Users activity logging & API
    activity: {
      enabled: true, // Enables Activity API and stores content, comment and user activities,
      permissions: {
        content: {
          created: ['public'],
          deleted: [defaultOptions.roles.admin],
          edited: [defaultOptions.roles.admin],
        },
        comments: {
          created: ['public'],
          deleted: [defaultOptions.roles.admin],
          edited: [defaultOptions.roles.admin],
        },
        users: {
          created: [defaultOptions.roles.admin],
          deleted: [defaultOptions.roles.admin],
          edited: [defaultOptions.roles.admin],
        },
      },
      initialActivity: initialActivity,
    },

    // Users configuration
    user: {
      captureGeolocation: true,
      initialUsers: [
        {
          username: 'admin',
          email: 'admin@demo.com',
          createdAt: Date.now(),
          roles: [defaultOptions.roles.admin, defaultOptions.roles.user],
          id: '1',
          password: 'admin',
          profile: {
            img: '/static/demo-images/default-avatar.jpg',
          },
        },
        {
          username: 'user',
          email: 'user@demo.com',
          createdAt: Date.now(),
          roles: [defaultOptions.roles.user],
          id: '2',
          password: 'user',
          profile: {
            img: '',
          },
        },
      ],
    },

    // Content configuration
    content: {
      types: [postContentType, productContentType],
      initialContent: initialContent,
    },
  }
}
